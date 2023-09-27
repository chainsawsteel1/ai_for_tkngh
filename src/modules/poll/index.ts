import autobind from 'autobind-decorator';
import Message from '@/message';
import Module from '@/module';
import serifs from '@/serifs';
import { genItem } from '@/vocabulary';
import config from '@/config';
import { Note } from '@/misskey/note';

export default class extends Module {
	public readonly name = 'poll';

	@autobind
	public install() {
		setInterval(() => {
			if (Math.random() < 0.1) {
				this.post();
			}
		}, 1000 * 60 * 60);

		return {
			mentionHook: this.mentionHook,
			timeoutCallback: this.timeoutCallback,
		};
	}

	@autobind
	private async post() {
		const duration = 1000 * 60 * 15;

		const polls = [ // TODO: Extract serif
			['珍しそうなもの', '先生方は、どれがいちばん珍しいと思いますか？'],
			['美味しそうなもの', '先生方は、どれがいちばん美味しいと思いますか？'],
			['重そうなもの', '先生方は、どれがいちばん重いと思いますか？'],
			['欲しいもの', '先生方は、どれがいちばん欲しいですか？'],
			['無人島に持っていきたいもの', '先生方は、無人島にひとつ持っていけるとしたらどれにしますか？'],
			['家に飾りたいもの', '先生方は、家に飾るとしたらどれにしますか？'],
			['売れそうなもの', '先生方は、どれがいちばん売れそうだと思いますか？'],
			['降ってきてほしいもの', '先生方は、どれが空から降ってきてほしいですか？'],
			['携帯したいもの', '先生方は、どれを携帯したいですか？'],
			['商品化したいもの', '先生方は、商品化するとしたらどれにしますか？'],
			['発掘されそうなもの', '先生方は、遺跡から発掘されそうなものはどれだと思いますか？'],
			['良い香りがしそうなもの', '先生方は、どれがいちばんいい香りがすると思いますか？'],
			['高値で取引されそうなもの', '先生方は、どれがいちばん高値で取引されると思いますか？'],
			['地球周回軌道上にありそうなもの', '先生方は、どれが地球周回軌道上を漂っていそうだと思いますか？'],
			['プレゼントしたいもの', '先生方は、私にプレゼントしてくれるとしたらどれにしますか？'],
			['プレゼントされたいもの', '先生方は、プレゼントでもらうとしたらどれにしますか？'],
			['私が持ってそうなもの', '先生方は、私が持ってそうなものはどれだと思いますか？'],
			['流行りそうなもの', '先生方は、どれが流行りそうだと思いますか？'],
			['朝ごはん', '先生方は、朝ごはんにどれが食べたいですか？'],
			['お昼ごはん', '先生方は、お昼ごはんにどれが食べたいですか？'],
			['お夕飯', '先生方は、お夕飯にどれが食べたいですか？'],
			['体に良さそうなもの', '先生方は、どれが体に良さそうだと思いますか？'],
			['後世に遺したいもの', '先生方は、どれを後世に遺したいですか？'],
			['楽器になりそうなもの', '先生方は、どれが楽器になりそうだと思いますか？'],
			['お味噌汁の具にしたいもの', '先生方は、お味噌汁の具にするとしたらどれがいいですか？'],
			['ふりかけにしたいもの', '先生方は、どれをごはんにふりかけたいですか？'],
			['よく見かけるもの', '先生方は、どれをよく見かけますか？'],
			['道に落ちてそうなもの', '先生方は、道端に落ちてそうなものはどれだと思いますか？'],
			['美術館に置いてそうなもの', '先生方は、この中で美術館に置いてありそうなものはどれだと思いますか？'],
			['教室にありそうなもの', '先生方は、教室にありそうなものってどれだと思いますか？'],
			['絵文字になってほしいもの', '絵文字になってほしいものはどれですか？'],
			['Misskey本部にありそうなもの', '先生方は、Misskey本部にありそうなものはどれだと思いますか？'],
			['燃えるゴミ', '先生方は、どれが燃えるゴミだと思いますか？'],
			['好きなおにぎりの具', '先生方の好きなおにぎりの具はなんですか？'],
		];

		const poll = polls[Math.floor(Math.random() * polls.length)];

		const choices = [
			genItem(),
			genItem(),
			genItem(),
			genItem(),
		];

		const note = await this.ai.post({
			text: poll[1],
			poll: {
				choices,
				expiredAfter: duration,
				multiple: false,
			}
		});

		// タイマーセット
		this.setTimeoutWithPersistence(duration + 3000, {
			title: poll[0],
			noteId: note.id,
		});
	}

	@autobind
	private async mentionHook(msg: Message) {
		if (!msg.or(['/poll']) || msg.user.username !== config.master) {
			return false;
		} else {
			this.log('Manualy poll requested');
		}

		this.post();

		return true;
	}

	@autobind
	private async timeoutCallback({ title, noteId }) {
		const note: Note = await this.ai.api('notes/show', { noteId });

		const choices = note.poll!.choices;

		let mostVotedChoice;

		for (const choice of choices) {
			if (mostVotedChoice == null) {
				mostVotedChoice = choice;
				continue;
			}

			if (choice.votes > mostVotedChoice.votes) {
				mostVotedChoice = choice;
			}
		}

		const mostVotedChoices = choices.filter(choice => choice.votes === mostVotedChoice.votes);

		if (mostVotedChoice.votes === 0) {
			this.ai.post({ // TODO: Extract serif
				text: '投票はありませんでした',
				renoteId: noteId,
			});
		} else if (mostVotedChoices.length === 1) {
			this.ai.post({ // TODO: Extract serif
				cw: `${title}アンケートの結果発表です！`,
				text: `結果は${mostVotedChoice.votes}票の「${mostVotedChoice.text}」でした！`,
				renoteId: noteId,
			});
		} else {
			const choices = mostVotedChoices.map(choice => `「${choice.text}」`).join('と');
			this.ai.post({ // TODO: Extract serif
				cw: `${title}アンケートの結果発表です！`,
				text: `結果は${mostVotedChoice.votes}票の${choices}でした！`,
				renoteId: noteId,
			});
		}
	}
}
