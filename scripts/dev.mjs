import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const CONVEX_READY_TEXT = 'Convex functions ready!';
export const CONVEX_STARTUP_ERROR_TEXT = '✖ Error:';

export function buildViteCommandArgs(args) {
	return args.length > 0 ? ['--', ...args] : [];
}

export function buildViteEnv(env) {
	return { ...env };
}

export function createConvexStartupTracker() {
	let status = 'pending';

	return {
		get status() {
			return status;
		},
		observe(output) {
			if (status !== 'pending') {
				return status;
			}

			if (output.includes(CONVEX_READY_TEXT)) {
				status = 'ready';
				return status;
			}

			if (output.includes(CONVEX_STARTUP_ERROR_TEXT)) {
				status = 'fatal';
			}

			return status;
		}
	};
}

function createDeferred() {
	let settled = false;
	let resolvePromise;
	let rejectPromise;

	return {
		get settled() {
			return settled;
		},
		promise: new Promise((resolve, reject) => {
			resolvePromise = (value) => {
				if (settled) {
					return;
				}

				settled = true;
				resolve(value);
			};
			rejectPromise = (reason) => {
				if (settled) {
					return;
				}

				settled = true;
				reject(reason);
			};
		}),
		resolve(value) {
			resolvePromise(value);
		},
		reject(reason) {
			rejectPromise(reason);
		}
	};
}

function terminateProcess(childProcess, signal) {
	if (!childProcess) {
		return;
	}

	if (childProcess.exitCode !== null || childProcess.signalCode !== null) {
		return;
	}

	childProcess.kill(signal);
}

function formatChildFailure(name, code, signal) {
	if (typeof code === 'number') {
		return `${name} exited with code ${code}.`;
	}

	return `${name} exited with signal ${signal ?? 'unknown'}.`;
}

function pipeChildOutput(stream, target, onOutput) {
	if (!stream) {
		return;
	}

	stream.on('data', (chunk) => {
		const output = chunk.toString('utf8');
		target.write(output);
		onOutput(output);
	});
}

function isEntrypoint(metaUrl = import.meta.url, argv = process.argv[1]) {
	if (!argv) {
		return false;
	}

	return fileURLToPath(metaUrl) === path.resolve(argv);
}

async function main(forwardedViteArgs = process.argv.slice(2), env = process.env) {
	const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
	const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
	const convexExitCode = { value: 0 };
	const startup = createDeferred();
	const startupTracker = createConvexStartupTracker();

	let shuttingDown = false;
	let convexExited = false;
	let viteExited = false;
	let viteProcess;

	const convexProcess = spawn(npmCommand, ['run', 'dev:convex'], {
		cwd: rootDir,
		env,
		stdio: ['inherit', 'pipe', 'pipe']
	});

	process.on('SIGINT', () => shutdown(0));
	process.on('SIGTERM', () => shutdown(0));

	const observeStartupOutput = (output) => {
		const status = startupTracker.observe(output);

		if (status === 'ready') {
			startup.resolve();
			return;
		}

		if (status === 'fatal') {
			startup.reject(new Error('Convex failed before the first successful push.'));
		}
	};

	pipeChildOutput(convexProcess.stdout, process.stdout, observeStartupOutput);
	pipeChildOutput(convexProcess.stderr, process.stderr, observeStartupOutput);

	convexProcess.on('error', (cause) => {
		startup.reject(
			new Error(
				`Failed to start Convex: ${cause instanceof Error ? cause.message : String(cause)}`
			)
		);
		shutdown(1);
	});

	convexProcess.on('exit', (code, signal) => {
		convexExited = true;

		if (!startup.settled) {
			startup.reject(new Error(formatChildFailure('Convex', code, signal)));
		}

		handleChildExit('Convex', code, signal);
	});

	try {
		await startup.promise;

		console.log('[dev] Convex functions ready. Starting Vite...');

		viteProcess = spawn(
			npmCommand,
			['run', 'dev:vite', ...buildViteCommandArgs(forwardedViteArgs)],
			{
				cwd: rootDir,
				env: buildViteEnv(env),
				stdio: 'inherit'
			}
		);

		viteProcess.on('error', (cause) => {
			console.error(
				`[dev] Failed to start Vite: ${cause instanceof Error ? cause.message : String(cause)}`
			);
			shutdown(1);
		});

		viteProcess.on('exit', (code, signal) => {
			viteExited = true;
			handleChildExit('Vite', code, signal);
		});
	} catch (cause) {
		const message =
			cause instanceof Error
				? cause.message
				: 'Failed to start the local Convex + Vite development runtime.';

		console.error(`[dev] ${message}`);
		shutdown(1);
	}

	function handleChildExit(name, code, signal) {
		const resolvedExitCode = typeof code === 'number' ? code : signal ? 1 : 0;

		if (!shuttingDown) {
			if (resolvedExitCode !== 0) {
				console.error(`[dev] ${name} exited with code ${resolvedExitCode}. Shutting down.`);
			}

			shutdown(resolvedExitCode);
			return;
		}

		if (resolvedExitCode !== 0 && convexExitCode.value === 0) {
			convexExitCode.value = resolvedExitCode;
		}

		maybeExit();
	}

	function shutdown(exitCode) {
		if (shuttingDown) {
			if (convexExitCode.value === 0) {
				convexExitCode.value = exitCode;
			}

			return;
		}

		shuttingDown = true;
		convexExitCode.value = exitCode;

		terminateProcess(viteProcess, 'SIGTERM');
		terminateProcess(convexProcess, 'SIGTERM');

		const forceKillTimer = setTimeout(() => {
			terminateProcess(viteProcess, 'SIGKILL');
			terminateProcess(convexProcess, 'SIGKILL');
			maybeExit();
		}, 5_000);

		forceKillTimer.unref();
		maybeExit();
	}

	function maybeExit() {
		if (!convexExited) {
			return;
		}

		if (viteProcess && !viteExited) {
			return;
		}

		process.exit(convexExitCode.value);
	}
}

if (isEntrypoint()) {
	void main();
}
