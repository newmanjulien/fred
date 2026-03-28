<script lang="ts">
	import type { FileUploadFieldData } from './FileUploadField.types';

	type Props = {
		data: FileUploadFieldData;
	};

	let { data }: Props = $props();

	let inputElement: HTMLInputElement | null = null;
	let files = $state<File[]>([]);
	let isDragging = $state(false);
	const allowMultipleFiles = $derived(data.allowMultipleFiles ?? true);
	const maxFiles = $derived(allowMultipleFiles ? 20 : 1);
	const inputId = $derived(`${data.sectionId}-upload`);

	const selectionSummary = $derived.by(() => {
		if (files.length === 0) {
			return allowMultipleFiles ? 'No files selected' : 'No file chosen';
		}

		if (files.length === 1) {
			return files[0].name;
		}

		return `${files.length} files selected`;
	});

	function matchesAcceptedFileType(file: File) {
		if (!data.acceptedFileTypes) {
			return true;
		}

		const acceptedTypes = data.acceptedFileTypes
			.split(',')
			.map((value) => value.trim().toLowerCase())
			.filter(Boolean);

		if (acceptedTypes.length === 0) {
			return true;
		}

		const fileName = file.name.toLowerCase();
		const fileType = file.type.toLowerCase();

		return acceptedTypes.some((acceptedType) => {
			if (acceptedType.startsWith('.')) {
				return fileName.endsWith(acceptedType);
			}

			if (acceptedType.endsWith('/*')) {
				const prefix = acceptedType.slice(0, -1);
				return fileType.startsWith(prefix);
			}

			return fileType === acceptedType;
		});
	}

	function setFiles(nextFiles: Iterable<File> | ArrayLike<File>) {
		files = Array.from(nextFiles)
			.filter(matchesAcceptedFileType)
			.slice(0, maxFiles);
	}

	function openPicker() {
		inputElement?.click();
	}

	function handleInputChange(event: Event) {
		const currentTarget = event.currentTarget as HTMLInputElement;

		setFiles(currentTarget.files ?? []);
		currentTarget.value = '';
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		const currentTarget = event.currentTarget;
		const relatedTarget = event.relatedTarget;

		if (!(currentTarget instanceof HTMLElement) || currentTarget.contains(relatedTarget as Node | null)) {
			return;
		}

		isDragging = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const droppedFiles = event.dataTransfer?.files;

		if (!droppedFiles) {
			return;
		}

		setFiles(droppedFiles);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') {
			return;
		}

		event.preventDefault();
		openPicker();
	}
</script>

<section class="rounded-md border border-zinc-100 bg-white px-3 py-3">
	<div class="space-y-1">
		<label for={inputId} class="text-xs font-medium tracking-wide text-zinc-900">
			{data.uploadLabel ?? 'Upload files'}
		</label>
		{#if data.uploadDescription}
			<p class="text-xs leading-relaxed tracking-wide text-zinc-500">
				{data.uploadDescription}
			</p>
		{/if}
	</div>

	<input
		bind:this={inputElement}
		id={inputId}
		name={inputId}
		type="file"
		accept={data.acceptedFileTypes}
		multiple={allowMultipleFiles}
		class="sr-only"
		onchange={handleInputChange}
	/>

	<div
		class={isDragging
			? 'mt-3 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-4 text-xs leading-relaxed tracking-wide text-zinc-600'
			: 'mt-3 rounded-md border border-dashed border-zinc-200 bg-zinc-50/35 px-4 py-4 text-xs leading-relaxed tracking-wide text-zinc-600 transition-colors'}
		role="button"
		tabindex="0"
		aria-controls={inputId}
		onclick={openPicker}
		onkeydown={handleKeyDown}
		ondragover={handleDragOver}
		ondragenter={() => {
			isDragging = true;
		}}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
		<div class="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="min-w-0">
				<p class="text-xs font-medium tracking-wide text-zinc-700">Select files or drop them here</p>
				<p class="mt-1 truncate text-xs leading-relaxed tracking-wide text-zinc-500">
					{selectionSummary}
				</p>
			</div>
			<button
				type="button"
				class="mr-0 flex h-7 shrink-0 items-center justify-center rounded-sm border border-zinc-100 px-2 text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:bg-zinc-100"
				onclick={(event) => {
					event.stopPropagation();
					openPicker();
				}}
			>
				Browse
			</button>
		</div>
	</div>
</section>
