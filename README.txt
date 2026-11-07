ランぬのわくわく古戦場！ 画像フォルダ整理版

【このZIPに入っているもの】
index.html：画像の読み込み先を切り替えたゲーム本体
items.js：肉スタンプラリーの限定報酬5件を追加したアイテム一覧
organize-images.ps1：Windowsで画像をフォルダ分けする補助ツール

このZIPには画像やmeat.js、messages.js、info.jsは入っていません。
既存のものを使ってください。meat.jsは今回添付されたものを参照し、
内容を変更していません。

【整理後の画像の置き場所】
次は全て index.html と同じ場所を基準にした相対パスです。
acc_*.png      → images/acc/
bg_*.png       → images/bg/
tops_*.png     → images/tops/
bottoms_*.png  → images/bottoms/
clothes_*.png  → images/clothes/
meat_*.png     → images/meat/

例：acc_1.png → images/acc/acc_1.png
画像ファイル名は変えません。ランぬ本体のlancelot_*.png、
avatar.png、logo.pngなどは元の場所のままです。

肉スタンプラリー報酬画像（meat_3000.png、meat_6000.png、
meat_9000.png、meat_12000.png、meat_15000.png）が用意できたら、
images/meat/ に入れてください。このZIPに画像は含まれていません。

【適用方法】
1. 公開中のリポジトリとは別のブランチやコピーで作業し、
   現在のファイルとセーブデータのバックアップを取ります。
2. ゲームのフォルダにZIPの index.html と items.js を置き、
   同名ファイルを置き換えます。index.html が今回提示してもらった
   版と違う場合は、そのまま上書きせず差分を確認してください。
3. 該当するPNGを上の置き場所に移します。手動でも、下の補助
   ツールを使っても構いません。どちらか一方だけを使ってください。
4. ゲームを確認してから画像の移動とコードの変更を同じコミットで
   GitHubに反映してください。ローカルで差し替えただけでは、
   GitHubや公開サイトには反映されません。

【Windowsで補助ツールを使う場合】
1. organize-images.ps1 をゲームの index.html と同じフォルダに置きます。
2. VS Codeでそのフォルダを開き、ターミナルで次を実行します。

powershell -NoProfile -ExecutionPolicy Bypass -File .\organize-images.ps1

これは移動対象の件数を表示するだけで、画像を移動しません。
3. 内容に問題がなければ次を実行します。

powershell -NoProfile -ExecutionPolicy Bypass -File .\organize-images.ps1 -Apply

該当する画像が images 内の6つのフォルダへ移ります。
ツールが対象にするのは、index.htmlと同じ階層にある各接頭辞のPNGです。
既に移動先に同じ名前のファイルがある場合は、上書きせず停止します。
途中でエラーになった場合は表示された内容を確認し、残りのファイルを
再実行または手動で移動してください。もとの画像は削除しないでください。

【確認したいこと】
・ショップとクローゼットの画像、頭・手・足・その他タブ
・移動前から着用していたアイテム、重なり順、着脱、おまかせ
・背景、プレビュー、ランぬの画像保存
・移動前のバックアップコードを読み込めること
・肉報酬：5つの画像を配置後、到達済みの報酬が解放され、
  通常ショップに並ばず、クローゼットで着用できること

画像URLの変更は一覧・プレビュー・本体表示・事前読込・画像保存に
適用しています。アイテムID、保存する画像名、解放情報、装備順は
変更しないため、以前のデータを引き継ぐ設計です。
