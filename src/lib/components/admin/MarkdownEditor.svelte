<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import Placeholder from '@tiptap/extension-placeholder';
	import Link from '@tiptap/extension-link';
	import Typography from '@tiptap/extension-typography';
	import Underline from '@tiptap/extension-underline';
	import TextAlign from '@tiptap/extension-text-align';
	import Highlight from '@tiptap/extension-highlight';
	import Subscript from '@tiptap/extension-subscript';
	import Superscript from '@tiptap/extension-superscript';
	import { storage } from '$lib/firebase';
	import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
	import imageCompression from 'browser-image-compression';
	import ProjectContent from '$lib/components/ProjectContent.svelte';
	import { ImageGroup } from '$lib/tiptap/imageGroup';

	let {
		value = $bindable(''),
		placeholder = 'Start writing...',
		imageFolder = 'content-images'
	} = $props();

	let element: HTMLElement;
	let editor: Editor | undefined = $state();
	let mode: 'edit' | 'preview' = $state('edit');

	// Image upload state
	let fileInput: HTMLInputElement;
	let imageUploading = $state(false);
	let imageUploadProgress = $state(0);
	let isImageSelected = $state(false);

	// Handle pasted images - upload to Firebase instead of embedding as base64
	async function handlePastedImage(file: File): Promise<string | null> {
		try {
			// Compress image
			const options = {
				maxSizeMB: 1,
				maxWidthOrHeight: 1920,
				useWebWorker: true
			};

			let fileToUpload = file;
			try {
				fileToUpload = await imageCompression(file, options);
			} catch (compressionError) {
				console.warn('Image compression failed, uploading original:', compressionError);
			}

			// Create storage reference
			const timestamp = Date.now();
			const uniqueName = `${timestamp}-pasted-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
			const storageRef = ref(storage, `${imageFolder}/${uniqueName}`);

			// Upload
			const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

			const downloadURL = await new Promise<string>((resolve, reject) => {
				uploadTask.on(
					'state_changed',
					() => {},
					(err) => reject(err),
					async () => {
						const url = await getDownloadURL(uploadTask.snapshot.ref);
						resolve(url);
					}
				);
			});

			return downloadURL;
		} catch (err) {
			console.error('Failed to upload pasted image:', err);
			return null;
		}
	}

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2, 3, 4] }
				}),
				Image.configure({ inline: true, allowBase64: false }),
				ImageGroup,
				Placeholder.configure({ placeholder, emptyEditorClass: 'is-editor-empty' }),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer hover:text-blue-800' }
				}),
				Typography,
				Underline,
				TextAlign.configure({ types: ['heading', 'paragraph'] }),
				Highlight.configure({ multicolor: true }),
				Subscript,
				Superscript
			],
			content: value,
			editorProps: {
				attributes: {
					class: 'prose prose-lg focus:outline-none min-h-[70vh] max-w-none py-8'
				},
				handlePaste: (view, event) => {
					const items = event.clipboardData?.items;
					if (!items) return false;

					for (const item of items) {
						if (item.type.startsWith('image/')) {
							event.preventDefault();
							const file = item.getAsFile();
							if (file) {
								// Show uploading state
								imageUploading = true;
								imageUploadProgress = 0;

								handlePastedImage(file).then((url) => {
									imageUploading = false;
									if (url && editor) {
										editor.chain().focus().setImage({ src: url }).run();
									}
								});
							}
							return true;
						}
					}
					return false;
				}
			},
			onUpdate: ({ editor }) => {
				value = editor.getHTML();
			},
			onSelectionUpdate: ({ editor }) => {
				// Check if an image node is selected
				const { selection } = editor.state;
				const node = selection.$anchor.parent;
				const isImage =
					editor.isActive('image') ||
					editor.isActive('imageGroup') ||
					(selection.node && selection.node.type.name === 'image');
				isImageSelected = isImage;
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});

	$effect(() => {
		if (editor && value && editor.getHTML() === '<p></p>' && value !== '<p></p>') {
			editor.commands.setContent(value);
		}
	});

	// Toolbar Actions
	const undo = () => editor?.chain().focus().undo().run();
	const redo = () => editor?.chain().focus().redo().run();
	const toggleBold = () => editor?.chain().focus().toggleBold().run();
	const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
	const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
	const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
	const toggleHighlight = () => editor?.chain().focus().toggleHighlight().run();
	const toggleSubscript = () => editor?.chain().focus().toggleSubscript().run();
	const toggleSuperscript = () => editor?.chain().focus().toggleSuperscript().run();
	const toggleH1 = () => editor?.chain().focus().toggleHeading({ level: 1 }).run();
	const toggleH2 = () => editor?.chain().focus().toggleHeading({ level: 2 }).run();
	const toggleH3 = () => editor?.chain().focus().toggleHeading({ level: 3 }).run();
	const toggleH4 = () => editor?.chain().focus().toggleHeading({ level: 4 }).run();
	const setParagraph = () => editor?.chain().focus().setParagraph().run();
	const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
	const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
	const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
	const toggleCode = () => editor?.chain().focus().toggleCodeBlock().run();
	const alignLeft = () => editor?.chain().focus().setTextAlign('left').run();
	const alignCenter = () => editor?.chain().focus().setTextAlign('center').run();
	const alignRight = () => editor?.chain().focus().setTextAlign('right').run();
	const alignJustify = () => editor?.chain().focus().setTextAlign('justify').run();
	const setLink = () => {
		const url = window.prompt('URL');
		if (url === null) return;
		if (url === '') {
			editor?.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
		editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	};

	// Image upload - triggers file picker
	const addImage = () => {
		fileInput?.click();
	};

	// Handle file selection and upload
	async function handleImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (!files || files.length === 0 || !editor) return;

		imageUploading = true;
		imageUploadProgress = 0;
		const uploadedUrls: string[] = [];

		try {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];

				// Compress image
				const options = {
					maxSizeMB: 1,
					maxWidthOrHeight: 1920,
					useWebWorker: true
				};

				let fileToUpload = file;
				try {
					fileToUpload = await imageCompression(file, options);
				} catch (compressionError) {
					console.warn('Image compression failed, uploading original:', compressionError);
				}

				// Create storage reference
				const timestamp = Date.now();
				const uniqueName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
				const storageRef = ref(storage, `${imageFolder}/${uniqueName}`);

				// Upload with progress
				const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

				const downloadURL = await new Promise<string>((resolve, reject) => {
					uploadTask.on(
						'state_changed',
						(snapshot) => {
							const singleFileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
							const overallProgress = (i * 100 + singleFileProgress) / files.length;
							imageUploadProgress = Math.round(overallProgress);
						},
						(err) => reject(err),
						async () => {
							const url = await getDownloadURL(uploadTask.snapshot.ref);
							resolve(url);
						}
					);
				});

				uploadedUrls.push(downloadURL);
			}

			// Insert images - as grouped gallery with caption if multiple, single if one
			if (uploadedUrls.length === 1) {
				editor.chain().focus().setImage({ src: uploadedUrls[0] }).run();
			} else if (uploadedUrls.length > 1) {
				editor.chain().focus().insertImageGroup(uploadedUrls).run();
			}
		} catch (err: any) {
			console.error('Image upload failed:', err);
			alert('Failed to upload image: ' + err.message);
		} finally {
			imageUploading = false;
			imageUploadProgress = 0;
			target.value = ''; // Reset input for next upload
		}
	}

	const addHr = () => editor?.chain().focus().setHorizontalRule().run();
	const clearFormat = () => editor?.chain().focus().clearNodes().unsetAllMarks().run();

	// Delete the currently selected image or image group
	const deleteSelectedImage = () => {
		if (editor?.isActive('imageGroup')) {
			editor.chain().focus().deleteNode('imageGroup').run();
		} else if (editor?.isActive('image')) {
			editor.chain().focus().deleteSelection().run();
		}
	};
</script>

<!-- Hidden file input for image uploads -->
<input
	type="file"
	bind:this={fileInput}
	class="hidden"
	accept="image/*"
	multiple
	onchange={handleImageUpload}
/>

<!-- Upload Progress Overlay -->
{#if imageUploading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="rounded-lg bg-white p-6 text-center shadow-xl">
			<div
				class="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
			></div>
			<p class="text-sm font-medium text-gray-700">Uploading images...</p>
			<p class="mt-1 text-lg font-semibold text-blue-600">{imageUploadProgress}%</p>
		</div>
	</div>
{/if}

<div class="flex flex-col">
	<!-- Top Toolbar: floats above the writing surface, sticks while scrolling -->
	<div
		class="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-gray-100 bg-white/95 py-2 backdrop-blur"
	>
		<!-- Undo/Redo -->
		<button type="button" onclick={undo} class="toolbar-btn" title="Undo" aria-label="Undo">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg
			>
		</button>
		<button type="button" onclick={redo} class="toolbar-btn" title="Redo" aria-label="Redo">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" /></svg
			>
		</button>
		<div class="divider"></div>

		<!-- Text Formatting -->
		<button
			type="button"
			onclick={toggleBold}
			class="toolbar-btn {editor?.isActive('bold') ? 'active' : ''}"
			title="Bold"
		>
			<span class="font-bold">B</span>
		</button>
		<button
			type="button"
			onclick={toggleItalic}
			class="toolbar-btn {editor?.isActive('italic') ? 'active' : ''}"
			title="Italic"
		>
			<span class="italic">I</span>
		</button>
		<button
			type="button"
			onclick={toggleUnderline}
			class="toolbar-btn {editor?.isActive('underline') ? 'active' : ''}"
			title="Underline"
		>
			<span class="underline">U</span>
		</button>
		<button
			type="button"
			onclick={toggleStrike}
			class="toolbar-btn {editor?.isActive('strike') ? 'active' : ''}"
			title="Strikethrough"
		>
			<span class="line-through">S</span>
		</button>
		<button
			type="button"
			onclick={toggleHighlight}
			class="toolbar-btn {editor?.isActive('highlight') ? 'active' : ''}"
			title="Highlight"
			aria-label="Highlight"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><path d="m9 11-6 6v3h9l3-3" /><path
					d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"
				/></svg
			>
		</button>
		<button
			type="button"
			onclick={toggleSubscript}
			class="toolbar-btn {editor?.isActive('subscript') ? 'active' : ''}"
			title="Subscript"
		>
			<span class="text-xs">X<sub>2</sub></span>
		</button>
		<button
			type="button"
			onclick={toggleSuperscript}
			class="toolbar-btn {editor?.isActive('superscript') ? 'active' : ''}"
			title="Superscript"
		>
			<span class="text-xs">X<sup>2</sup></span>
		</button>
		<div class="divider"></div>

		<!-- Headings -->
		<button
			type="button"
			onclick={setParagraph}
			class="toolbar-btn {editor?.isActive('paragraph') ? 'active' : ''}"
			title="Paragraph">P</button
		>
		<button
			type="button"
			onclick={toggleH1}
			class="toolbar-btn {editor?.isActive('heading', { level: 1 }) ? 'active' : ''}"
			title="Heading 1">H1</button
		>
		<button
			type="button"
			onclick={toggleH2}
			class="toolbar-btn {editor?.isActive('heading', { level: 2 }) ? 'active' : ''}"
			title="Heading 2">H2</button
		>
		<button
			type="button"
			onclick={toggleH3}
			class="toolbar-btn {editor?.isActive('heading', { level: 3 }) ? 'active' : ''}"
			title="Heading 3">H3</button
		>
		<button
			type="button"
			onclick={toggleH4}
			class="toolbar-btn {editor?.isActive('heading', { level: 4 }) ? 'active' : ''}"
			title="Heading 4">H4</button
		>
		<div class="divider"></div>

		<!-- Alignment -->
		<button
			type="button"
			onclick={alignLeft}
			class="toolbar-btn {editor?.isActive({ textAlign: 'left' }) ? 'active' : ''}"
			title="Align Left"
			aria-label="Align Left"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><line x1="21" x2="3" y1="6" y2="6" /><line x1="15" x2="3" y1="12" y2="12" /><line
					x1="17"
					x2="3"
					y1="18"
					y2="18"
				/></svg
			>
		</button>
		<button
			type="button"
			onclick={alignCenter}
			class="toolbar-btn {editor?.isActive({ textAlign: 'center' }) ? 'active' : ''}"
			title="Align Center"
			aria-label="Align Center"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><line x1="21" x2="3" y1="6" y2="6" /><line x1="17" x2="7" y1="12" y2="12" /><line
					x1="19"
					x2="5"
					y1="18"
					y2="18"
				/></svg
			>
		</button>
		<button
			type="button"
			onclick={alignRight}
			class="toolbar-btn {editor?.isActive({ textAlign: 'right' }) ? 'active' : ''}"
			title="Align Right"
			aria-label="Align Right"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="9" y1="12" y2="12" /><line
					x1="21"
					x2="7"
					y1="18"
					y2="18"
				/></svg
			>
		</button>
		<div class="divider"></div>

		<!-- Lists -->
		<button
			type="button"
			onclick={toggleBulletList}
			class="toolbar-btn {editor?.isActive('bulletList') ? 'active' : ''}"
			title="Bullet List"
			aria-label="Bullet List"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line
					x1="8"
					x2="21"
					y1="18"
					y2="18"
				/><circle cx="3" cy="6" r="1.5" fill="currentColor" /><circle
					cx="3"
					cy="12"
					r="1.5"
					fill="currentColor"
				/><circle cx="3" cy="18" r="1.5" fill="currentColor" /></svg
			>
		</button>
		<button
			type="button"
			onclick={toggleOrderedList}
			class="toolbar-btn {editor?.isActive('orderedList') ? 'active' : ''}"
			title="Numbered List"
			aria-label="Numbered List"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line
					x1="10"
					x2="21"
					y1="18"
					y2="18"
				/><text x="2" y="9" font-size="8" fill="currentColor" stroke="none">1</text><text
					x="2"
					y="15"
					font-size="8"
					fill="currentColor"
					stroke="none">2</text
				><text x="2" y="21" font-size="8" fill="currentColor" stroke="none">3</text></svg
			>
		</button>
		<button
			type="button"
			onclick={toggleBlockquote}
			class="toolbar-btn {editor?.isActive('blockquote') ? 'active' : ''}"
			title="Quote"
			aria-label="Quote"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><path
					d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"
				/><path
					d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"
				/></svg
			>
		</button>
		<div class="divider"></div>

		<!-- Code & Link -->
		<button
			type="button"
			onclick={toggleCode}
			class="toolbar-btn {editor?.isActive('codeBlock') ? 'active' : ''}"
			title="Code Block"
			aria-label="Code Block"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg
			>
		</button>
		<button
			type="button"
			onclick={setLink}
			class="toolbar-btn {editor?.isActive('link') ? 'active' : ''}"
			title="Link"
			aria-label="Link"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path
					d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
				/></svg
			>
		</button>
		<button type="button" onclick={addImage} class="toolbar-btn" title="Image" aria-label="Image">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle
					cx="9"
					cy="9"
					r="2"
				/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg
			>
		</button>
		{#if isImageSelected}
			<button
				type="button"
				onclick={deleteSelectedImage}
				class="toolbar-btn text-red-600 hover:bg-red-100"
				title="Delete Selected Image"
				aria-label="Delete Selected Image"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					><polyline points="3 6 5 6 21 6" /><path
						d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
					/><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg
				>
			</button>
		{/if}
		<button
			type="button"
			onclick={addHr}
			class="toolbar-btn"
			title="Horizontal Rule"
			aria-label="Horizontal Rule"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"><line x1="3" x2="21" y1="12" y2="12" /></svg
			>
		</button>

		<!-- Clear -->
		<button
			type="button"
			onclick={clearFormat}
			class="toolbar-btn"
			title="Clear Formatting"
			aria-label="Clear Formatting"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /><path
					d="m5 19 14-14"
				/></svg
			>
		</button>

		<!-- Spacer -->
		<div class="flex-grow"></div>

		<!-- Mode Toggle -->
		<div class="flex items-center gap-1 rounded bg-gray-200 p-0.5">
			<button
				type="button"
				onclick={() => (mode = 'edit')}
				class="rounded px-2 py-0.5 text-xs font-medium transition-colors {mode === 'edit'
					? 'bg-white text-gray-900 shadow-sm'
					: 'text-gray-500 hover:text-gray-900'}"
			>
				Edit
			</button>
			<button
				type="button"
				onclick={() => (mode = 'preview')}
				class="rounded px-2 py-0.5 text-xs font-medium transition-colors {mode === 'preview'
					? 'bg-white text-gray-900 shadow-sm'
					: 'text-gray-500 hover:text-gray-900'}"
			>
				Preview
			</button>
		</div>
	</div>

	<!-- Editor / Preview Area -->
	<div class="min-h-[70vh] bg-white text-gray-900">
		<!-- Editor always mounted, hidden when in preview mode -->
		<div bind:this={element} class="h-full w-full" class:hidden={mode === 'preview'}></div>
		<!-- Preview renders exactly what the public project page will show -->
		{#if mode === 'preview'}
			<div class="py-8">
				<ProjectContent html={value} />
			</div>
		{/if}
	</div>
</div>

<style>
	/* Toolbar button styles (light theme) */
	.toolbar-btn {
		border-radius: 0.375rem;
		padding: 0.5rem;
		font-size: 0.75rem;
		color: #6b7280;
		transition:
			background-color 0.15s,
			color 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
	}
	.toolbar-btn:hover {
		background-color: #e5e7eb;
		color: #111827;
	}
	.toolbar-btn.active {
		background-color: #e5e7eb;
		color: #111827;
	}
	.divider {
		margin-left: 0.375rem;
		margin-right: 0.375rem;
		height: 1.5rem;
		width: 1px;
		background-color: #d1d5db;
	}
	/* Placeholder styling */
	:global(.is-editor-empty:first-child::before) {
		color: #9ca3af;
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}
	:global(.ProseMirror) {
		outline: none;
		min-height: 70vh;
	}
	/* Table styles */
	:global(.ProseMirror table) {
		border-collapse: collapse;
		margin: 0;
		overflow: hidden;
		table-layout: fixed;
		width: 100%;
	}
	:global(.ProseMirror td, .ProseMirror th) {
		border: 1px solid #d1d5db;
		box-sizing: border-box;
		min-width: 1em;
		padding: 6px 8px;
		position: relative;
		vertical-align: top;
	}
	:global(.ProseMirror th) {
		background-color: #f3f4f6;
		font-weight: bold;
		text-align: left;
	}
	:global(.ProseMirror .selectedCell:after) {
		background: rgba(200, 200, 255, 0.4);
		content: '';
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		pointer-events: none;
		position: absolute;
		z-index: 2;
	}

	/* Image gallery masonry for multiple images */
	:global(.image-gallery) {
		column-count: 2;
		column-gap: 0.5rem;
		margin: 1rem 0;
		width: 100%;
	}
	:global(.image-gallery img) {
		width: 100%;
		height: auto;
		margin-bottom: 0.5rem;
		break-inside: avoid;
		display: block;
		border-radius: 8px;
		cursor: pointer;
		transition:
			transform 0.2s,
			opacity 0.2s;
	}
	:global(.image-gallery img:hover) {
		transform: scale(1.02);
		opacity: 0.9;
	}

	/* Image group: bordered collection card with editable caption underneath */
	:global(.ProseMirror .image-group) {
		margin: 1.5rem 0;
		padding: 0.875rem;
		border: 1px solid #e5e7eb;
		border-radius: 14px;
		background: #ffffff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	}
	:global(.ProseMirror .image-group .image-gallery) {
		margin: 0 0 0.5rem;
	}
	:global(.ProseMirror .image-group-caption) {
		padding-top: 0.625rem;
		border-top: 1px solid #f3f4f6;
		text-align: center;
		font-size: 0.9375rem;
		color: #6b7280;
	}
	:global(.ProseMirror .image-group-caption p.is-empty::before) {
		color: #9ca3af;
		content: 'Write a caption…';
		float: left;
		width: 100%;
		height: 0;
		pointer-events: none;
	}
	:global(.ProseMirror .image-group.ProseMirror-selectednode) {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* Image delete buttons in editor */
	:global(.ProseMirror img) {
		position: relative;
		cursor: pointer;
		transition: opacity 0.2s;
	}
	:global(.ProseMirror img:hover) {
		opacity: 0.9;
	}
	:global(.ProseMirror img.ProseMirror-selectednode) {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>
