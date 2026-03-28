<script lang="ts">
	import {
		useDashboardHeaderUiController,
		type DashboardHeaderUiScope
	} from './ui-controller';

	type Props = {
		scopeId: string;
		scope?: DashboardHeaderUiScope | null;
	};

	let { scopeId, scope = null }: Props = $props();
	const headerUiController = useDashboardHeaderUiController();

	$effect(() => {
		if (scope) {
			headerUiController.setScope(scopeId, scope);
		} else {
			headerUiController.clearScope(scopeId);
		}

		return () => {
			headerUiController.clearScope(scopeId);
		};
	});
</script>
