import autobind from 'autobind-decorator';
import Module from '@/module';
import Message from '@/message';
import { genItem } from '@/vocabulary';
import serifs from '@/serifs';

export default class extends Module {
	public readonly name = 'note';

	@autobind
	public install() {
		return {
			mentionHook: this.mentionHook
		};
	}

	@autobind
	private async mentionHook(msg: Message) {
		if (msg.text && msg.text.includes('ノートして')) {
			setTimeout(() => {
				const notes = [
					...serifs.noting.notes,
					() => {
						const item = genItem();
						return serifs.noting.want(item);
					},
					() => {
						const item = genItem();
						return serifs.noting.see(item);
					},
					() => {
						const item = genItem();
						return serifs.noting.expire(item);
					},
				];
			}, 3000);
			return true;
		} else {
			return false;
		}
	}
}
