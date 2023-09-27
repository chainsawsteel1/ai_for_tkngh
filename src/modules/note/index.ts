import autobind from 'autobind-decorator';
import Module from '@/module';
import Message from '@/message';

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
				this.ai.api('notes/create', {
					renoteId: note.id
				});
			}, 3000);
			return true;
		} else {
			return false;
		}
	}
}
