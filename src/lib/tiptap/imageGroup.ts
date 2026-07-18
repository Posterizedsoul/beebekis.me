import { Node } from '@tiptap/core';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		imageGroup: {
			/** Insert a group of images rendered together, with editable caption text underneath. */
			insertImageGroup: (images: string[]) => ReturnType;
		};
	}
}

/**
 * A block node holding a set of images displayed together (masonry gallery)
 * with editable paragraph(s) underneath as a caption. Serializes to:
 * <div class="image-group">
 *   <div class="image-gallery"><img/>...</div>
 *   <div class="image-group-caption"><p>...</p></div>
 * </div>
 */
export const ImageGroup = Node.create({
	name: 'imageGroup',
	group: 'block',
	content: 'paragraph+',
	isolating: true,
	defining: true,
	draggable: true,

	addAttributes() {
		return {
			images: {
				default: [] as string[],
				parseHTML: (el: HTMLElement) =>
					Array.from(el.querySelectorAll('img'))
						.map((img) => img.getAttribute('src'))
						.filter(Boolean),
				// images are rendered manually in renderHTML, not as an attribute
				renderHTML: () => ({})
			}
		};
	},

	parseHTML() {
		return [
			{ tag: 'div.image-group', contentElement: '.image-group-caption' },
			// legacy galleries saved before captions existed
			{ tag: 'div.image-gallery' }
		];
	},

	renderHTML({ node }) {
		return [
			'div',
			{ class: 'image-group' },
			[
				'div',
				{ class: 'image-gallery', contenteditable: 'false' },
				...(node.attrs.images as string[]).map((src) => ['img', { src, alt: '' }])
			],
			['div', { class: 'image-group-caption' }, 0]
		];
	},

	addCommands() {
		return {
			insertImageGroup:
				(images: string[]) =>
				({ commands }) =>
					commands.insertContent([
						{ type: this.name, attrs: { images }, content: [{ type: 'paragraph' }] },
						{ type: 'paragraph' }
					])
		};
	}
});
