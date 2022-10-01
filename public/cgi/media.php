<input type='file' class='hidden'></input>
<main><div class='t2x1'><a draggable='false' href='#' class='mcard' title='Import data' data-type='import'></a><a draggable='false' href='#' class='mcard' title='Export data' data-type='export'></a></div><?js
var types = ['frame', 'nes', 'gba', 'util', 'virtual'], types_map = {};

[
	['frame', 'Minecraft', '/assets/media/mc/'],
	['frame', '1v1.lol', '/gateway?url=' + encodeURIComponent(btoa('1v1.lol'))],
	['frame', 'Krunker', '/gateway?url=' + encodeURIComponent(btoa('krunker.io'))],
	['frame', 'Super Mario 64', '/assets/media/sm/'],
	['frame', 'Sonic 1', '/assets/media/so/?data=1'],
	['frame', 'Sonic 2', '/assets/media/so/?data=2'],
	['frame', 'Duck Life 1', '/assets/media/d1'],
	['frame', 'Duck Life 2', '/assets/media/d2'],
	['frame', 'Duck Life 3', '/assets/media/d3'],
	['frame', 'Duck Life 4', '/assets/media/d4'],
	['frame', 'Cookie Clicker', '/assets/media/cc'],
	['nes', 'Super Mario Bros', '/assets/media/smb.nes'],
	['nes', 'Super Mario Bros 2', '/assets/media/smb2.nes'],
	['nes', 'Super Mario Bros 3', '/assets/media/smb3.nes'],
	['gba', 'Super Mario Advance 2', '/assets/media/gb/#smba2'],
	['gba', 'Mario Kart: Super Circuit', '/assets/media/gb/#mksc'],
	['gba', 'Pokemon Emerald', '/assets/media/gb/#pkme'],
	['gba', 'Pokemon Red', '/assets/media/gb/#pkmr'],
	['gba', 'Pokemon Green', '/assets/media/gb/#pkmg'],
	['gba', 'Pokemon Ruby', '/assets/media/gb/#pkmru'],
	['util', 'HTML editor', '/assets/media/ht.html'],
	['util', 'JS Console', '/assets/media/jc'],
	['util', 'Jor1k', '/assets/media/jo'],
	['virtual', 'MS-DOS 6.22', {W:{url:"/assets/media/v8/msdos.img",size:8388608,async:!1},Tc:306}],
	['virtual', 'Windows 1.0', {xa:{url:"/assets/media/v8/w101.img",size:1474560,async:!1}}],
	['virtual', 'Windows 95', {L:33554432,W:{url:"/assets/media/v8/w95.img",size:242049024,async:!0,va:true},state:{url:"/assets/media/v8/w95_state.bin.zst"}}, 16],
	['virtual', 'Windows 98', {L:134217728,W:{url:"/assets/media/v8/w98.img",async:!0,va:true,size:314572800},state:{url:"/assets/media/v8/w98_state.bin.zst"},rc:!0}],
	['virtual', 'ReactOS', {L:536870912,W:{url:"/assets/media/v8/reactos.img",size:524288E3,async:!0,va:true},state:{url:"/assets/media/v8/reactos_state.bin.zst"},rc:!0}],
	['virtual', 'TinyCore', {L:268435456,W:{url:"/assets/media/v8/tinycore-11.0.iso",async:!1}}],
	['virtual', 'Small Linux', {L:268435456,qa:{url:"/assets/media/v8/dsl-4.11.rc2.iso",size:52824064,async:!1}}],
	
].forEach(([ type, name, path ]) => {
	var obj = typeof path == 'object';
	
	echo('<a draggable="false" class="mcard" data-type="' + type + '" title=' + JSON.stringify(name) + ' ' + (obj ? 'data-path' : 'href') + '=' + (obj ? JSON.stringify(encodeURIComponent(JSON.stringify(path))) : JSON.stringify(path)) + ' ');
	
	types_map[type] = (types_map[type] || 0) + 1;
	
	echo('><div class="image" style="background-position:-' + ((types_map[type] - 1) * 200) + 'px -' + (types.indexOf(type) * 200) + 'px"></div><div class="label">' + nodehttp.sanitize(name) + '</div></a>');
});

global.scripts.unshift('assets/db.js', 'assets/nes.js', 'assets/v86.js');
?>
</main>
<div class='frame'>
	<div class='txt'></div>
	<canvas class='vga'></canvas>
	<div class='buttons'>
		<div class='button reload'><svg height='24' viewBox='0 0 24 24' width='24'><path d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' fill='currentColor'/></svg></div>
		<div class='button fullscreen'></div>
		<div class='button close'><svg height='24' viewBox='0 0 24 24' width='24'><path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' fill='currentColor'/></svg></div>
	</div>
	<iframe></iframe>
</div>