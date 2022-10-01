'use strict';
var add_ele = (tag, par, atr) => Object.assign(par.appendChild(document.createElement(tag)), atr),
	main = document.querySelector('main'),
	service = {
		container: document.querySelector('.service.frame'),
		hide(){
			document.body.dataset.service = 0;
			this.frame.src = 'about:blank';
		},
		init(){
			this.frame = this.container.querySelector('iframe');
			this.buttons = {
				container: this.container.querySelector('.buttons'),
			};
			
			[...this.buttons.container.children].forEach(node => this.buttons[node.classList[1]] = node);
			
			this.buttons.close.addEventListener('click', () => this.hide());
			this.buttons.reload.addEventListener('click', () => this.frame.src = this.frame.src);
		},
		search(node){
			var bar = node.querySelector('input'),
				datalist = node.querySelector('datalist'),
				queries = array => array.forEach(query => add_ele('option', datalist, { value: query }));
			
			node.addEventListener('input', event => {
				datalist.innerHTML = '';
				
				if(bar.value.length)fetch('/search?q=' + encodeURIComponent(bar.value)).then(res => res.json()).then(queries);
				else queries([ 'google.com', 'invidious.tube', 'wolframalpha.com', 'discord.com', 'reddit.com', '1v1.lol', 'krunker.io' ]);
			});
		},
		settings: document.querySelector('nav > .settings'),
		nav: {
			main: document.querySelector('nav'),
			search: {},
		},
	};

service.nav.search.main = service.nav.main.querySelector('nav > .search'),
service.nav.search.bar = service.nav.main.querySelector('nav > .search-bar'),

service.nav.toggle = service.nav.main.querySelector('nav > .toggle');
service.nav.menu = service.nav.main.querySelector('nav > .menu');

service.init();

service.nav.toggle.addEventListener('click', () => service.nav.main.dataset.menu ^= 1);

service.nav.search.main.addEventListener('click', () => service.nav.main.dataset.search = 1);

document.body.addEventListener('click', event => {
	if(!service.nav.search.bar.contains(event.target) && !service.nav.search.main.contains(event.target))service.nav.main.dataset.search = 0;
	
	if(!service.settings.contains(event.target))service.settings.dataset.open = 0;
	
	if(!service.nav.menu.contains(event.target) && !service.nav.toggle.contains(event.target))service.nav.main.dataset.menu = 0;
});

service.nav.search.bar.querySelector('.cancel').addEventListener('click', event => {
	event.preventDefault();
	service.nav.main.dataset.search = 0;
});

service.settings_popup = service.settings.querySelector('.popup');
service.appearance = service.settings_popup.querySelector('.appearance');
service.appearance_text = service.appearance.querySelector('span');

service.appearance.addEventListener('click', () => {
	var dark = document.body.dataset.appearance == 'dark',
		newa = dark ? 'light' : 'dark';
	
	document.cookie = 'appearance=' + newa + ';';
	
	document.body.dataset.appearance = newa;
	
	service.appearance_text.textContent = newa[0].toUpperCase() + newa.substr(1) + ' mode';
});

service.settings.addEventListener('click', event => service.settings.contains(event.target) && !service.settings_popup.contains(event.target) && (service.settings.dataset.open ^= 1));

service.search(service.nav.search.bar);

switch(document.body.dataset.page){
	case'home':
		
		var string,
			node = document.querySelector('.adjective'),
			ind = 1,
			speed = parseInt(node.dataset.speed),
			delay = parseInt(node.dataset.delay),
			strings = node.dataset.strings.split('|'),
			cooldown = delay,
			interval = delay / speed;
		
		setInterval(() => {
			if(string){
				node.textContent += string.slice(0, 1);
				string = string.slice(1);
				
				cooldown = delay;
			}else if((cooldown -= interval) < 0 && !(node.textContent = node.textContent.slice(0, -1)))string = strings[ind++ % strings.length];
		}, interval);
		service.search(document.querySelector('main > .search'));
		
		break;
	case'media':
		
		window.WebSocket = class extends WebSocket {
			constructor(url, proto){
				super('ws' + (location.protocol == 'https:' ? 's' : '') + '://' + location.host + '/service' + encodeURIComponent('url=' + encodeURIComponent(url.split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join(''))), proto);
				
				this.addEventListener('message', event => event.data == 'srv-alive' && event.stopImmediatePropagation() + this.send('srv-alive') || event.data == 'srv-open' && event.stopImmediatePropagation() + this.dispatchEvent(new Event('open', { srcElement: this, target: this })));

				this.addEventListener('open', event => event.stopImmediatePropagation(), { once: true });
			}
		};
		
		var audio_buf = 512,
			sample_count = 4*1024,
			sample_mask = sample_count - 1,
			audio_samples_l = new Float32Array(sample_count),
			audio_samples_r = new Float32Array(sample_count),
			audio_write_cursor = 0,
			audio_read_cursor = 0,
			framebuffer_u32 = new Float32Array(),
			nes = new jsnes.NES({
				onFrame(framebuffer_24){
					for(var i = 0; i < 61440; i++)framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i];
				},
				onAudioSample(l, r){
					audio_samples_l[audio_write_cursor] = l;
					audio_samples_r[audio_write_cursor] = r;
					audio_write_cursor = (audio_write_cursor + 1) & sample_mask;
				},
			}),
			keyboard = event => {
				var button = { 38: 'UP', 40: 'DOWN', 37: 'LEFT', 39: 'RIGHT', 65: 'A', 81: 'A', 79: 'B', 83: 'B', 9: 'SELECT', 13: 'START' };
				
				if(button[event.keyCode])nes.controllers[1]['button' + (event.type == 'keydown' ? 'Down' : 'Up')](jsnes.Controller['BUTTON_' + button[event.keyCode]]);
			},
			db = require('db');
		
		document.addEventListener('keydown', keyboard);
		document.addEventListener('keyup', keyboard);
		
		var picker = document.querySelector('input[type="file"]'),
			virtual,
			nes,
			audio_ctx,
			frame = {
				cont: document.querySelector('.frame:not(.service)'),
				close(){
					frame.cont.removeAttribute('style');
					main.removeAttribute('style');
					frame.main.src = 'about:blank';
					frame.cont.dataset.visible = frame.cont.dataset.virtual = frame.cont.dataset.nes = false;
					
					if(virtual){
						virtual.stop();
						setTimeout(() => (virtual.destroy(), virtual = null), 100);
					}
					
					if(audio_ctx)audio_ctx.close(), audio_ctx = null;
				},
				size_svg: {
					expand: '<svg height="14" viewBox="0 0 24 24" width="14"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/></svg>',
					exit: '<svg height="14" viewBox="0 0 24 24" width="14"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor"/></svg>',
				},
			};

		frame.main = frame.cont.querySelector('iframe');
		frame.buttons = frame.cont.querySelector('.buttons');
		
		frame.reload = frame.buttons.querySelector('.reload');
		frame.fullsrc = frame.buttons.querySelector('.fullscreen');
		
		frame.reload.addEventListener('click', () => {
			if(frame.cont.dataset.nes == 'true')nes.loadROM(nes.romData);
			else if(virtual)virtual.v.send('cpu-restart');
			else frame.main.src = frame.main.src;
		});
		
		frame.close();
		
		window.addEventListener('beforeunload', () => frame.close());
		
		frame.cont.addEventListener('fullscreenchange', () => {
			frame.fullscreen = document.fullscreenElement == frame.cont;
			
			frame.fullsrc.innerHTML = frame.fullscreen ? frame.size_svg.exit : frame.size_svg.expand;	
		});
		
		frame.buttons.querySelector('.close').addEventListener('click', () => frame.close());
		
		frame.fullsrc.addEventListener('click', () => frame.fullscreen ? document.exitFullscreen() : frame.cont.requestFullscreen());
		
		frame.vga = frame.cont.querySelector('.vga');
		frame.text = frame.cont.querySelector('.txt');
		
		frame.vga_ctx = frame.vga.getContext('2d');
		frame.vga.addEventListener('click', () => frame.vga.width && frame.vga.requestPointerLock());
		
		document.querySelectorAll('.mcard').forEach(node => node.addEventListener('click', event => {
			event.preventDefault();
			
			switch(node.dataset.type){
				case'nes':
					
					frame.vga.style = 'width:0px';
					
					frame.cont.dataset.nes = frame.cont.dataset.visible = 1;
					main.style.display = 'none';
					frame.fullsrc.innerHTML = frame.size_svg.expand;
					
					setTimeout(() => frame.vga.style = 'width:auto');
					
					var req = new XMLHttpRequest();
					req.open('GET', node.href);
					req.overrideMimeType('text/plain; charset=x-user-defined');
					
					req.addEventListener('load', () => {
						nes.loadROM(req.responseText);
						
						audio_ctx = new AudioContext();
						
						var image = frame.vga_ctx.getImageData(0, 0, 256, 240),
							buffer = new ArrayBuffer(image.data.length),
							framebuffer_u8 = new Uint8ClampedArray(buffer),
							script_processor = audio_ctx.createScriptProcessor(audio_buf, 0, 2),
							anim_frame = () => {
								if(frame.cont.dataset.nes != '1')return;
								
								setTimeout(anim_frame, 1000 / 45);
								
								image.data.set(framebuffer_u8);
								frame.vga_ctx.putImageData(image, 0, 0);
								nes.frame();
								
							};
						
						requestAnimationFrame(anim_frame);
						
						frame.vga.width = 256;
						frame.vga.height = 240;

						frame.vga_ctx.fillStyle = 'black';
						frame.vga_ctx.fillRect(0, 0, 256, 240);
						
						framebuffer_u32 = new Uint32Array(buffer);
						
						script_processor.addEventListener('audioprocess', event => {
							// attempt to avoid buffer underruns
							if(((audio_write_cursor - audio_read_cursor) & sample_mask) < audio_buf)nes.frame();
							
							var dst_l = event.outputBuffer.getChannelData(0),
								dst_r = event.outputBuffer.getChannelData(1);
							
							for(var i = 0; i < event.outputBuffer.length; i++){
								var src_idx = (audio_read_cursor + i) & sample_mask;
								dst_l[i] = audio_samples_l[src_idx];
								dst_r[i] = audio_samples_r[src_idx];
							}
							
							audio_read_cursor = (audio_read_cursor + event.outputBuffer.length) & sample_mask;
						});
						
						script_processor.connect(audio_ctx.destination);
					});
					
					req.send();
					
					break;
				case'virtual':
					
					frame.cont.dataset.virtual = frame.cont.dataset.visible = 1;
					main.style.display = 'none';
					frame.fullsrc.innerHTML = frame.size_svg.expand;
					
					var profile = JSON.parse(decodeURIComponent(node.dataset.path));
					
					if(typeof window.V86 != 'undefined' && typeof window.WebAssembly != 'undefined'){
						virtual = new V86({
							wasm_path: '/assets/media/v8/v86.wasm',
							screen_container: frame.cont,
							memory_size: profile.L || 2**28,
							vga_memory_size: profile.na || 16777216,
							bios: { url: '/assets/media/v8/seabios.bin' },
							vga_bios: { url: '/assets/media/v8/vgabios.bin'},
							network_relay_url: 'wss://relay.widgetry.org/',
							autostart: true,
							acpi: false,
							boot_order: profile.Tc || 0,
							fda: profile.xa,
							hda: profile.W,
							hdb: profile.Pe,
							cdrom: profile.qa,
							multiboot: profile.Rd,
							bzimage: profile.xc,
							initrd: profile.Od,
							cmdline: profile.ee,
							bzimage_initrd_from_filesystem:profile.Wf,
							initial_state: profile.bd || profile.state,
							filesystem: profile.filesystem || {},
							preserve_mac_from_state_image: profile.rc,
						});
						
						virtual.add_listener = virtual.Sa;
						
						virtual.destroy = virtual.Ba;
						
					}else (frame.text.style.display = 'block', frame.text.textContent = 'Your browser does not support virtualization.');
					
					break;
				case'gba':
				case'frame':
				case'util':
					
					frame.cont.dataset.visible = 1;
					main.style.display = 'none';
					frame.main.src = node.href;
					frame.fullsrc.innerHTML = frame.size_svg.expand;
					
					break;
				case'import':
					
					if(confirm('Warning, this will override ANY game storage. Do you wish to proceed?'))picker.click();
					
					break;
				case'export':
					
					var ls = new db('storage.db', '', false),
						link = add_ele('a', document.body);
					
					link.download = ls.file;
					
					for(var ind = 0; ind < localStorage.length; ind++){
						var key = localStorage.key(ind),
							val = localStorage.getItem(key);
						
						ls.set(key, val);
					}
					
					link.href = URL.createObjectURL(new Blob([ ls.store ], { type: 'application/octet-stream' }));
					
					link.click();
					
					break;
			}
		}));
		
		picker.addEventListener('change', () => {
			var reader = new FileReader();
			
			reader.addEventListener('load', () => {
				localStorage.clear();
				
				new db('storage.db', reader.result, false).forEach((val, key) => {
					localStorage.setItem(key, val);
				});
			});
			
			reader.readAsArrayBuffer(picker.files[0]);
		});
		
		break;
	case'knowledgebase':
		
		var scroll_anchor = () => document.querySelectorAll('main > section > h1 > a[href=' + JSON.stringify(location.hash) + ']').forEach(node => node.parentNode.parentNode.scrollIntoView()),
			bar = document.querySelector('.banner > .nav-search > input'),
			sections = document.querySelectorAll('main > section'),
			note = document.querySelector('main > .note'),
			clean = str => str.toLowerCase().trim().replace(/\s+/g, '');
		
		setTimeout(scroll_anchor);
		
		document.querySelector('.banner').addEventListener('submit', event => {
			event.preventDefault();
		});
		
		bar.addEventListener('input', () => {
			var found = sections.length;
			
			sections.forEach(node => node.style.display = clean(node.children[0].textContent).includes(clean(bar.value)) ? 'block' : (found--, 'none'));
			
			note.innerHTML = found
				? `Not what you're looking for? Try asking on the <a href='?1'>chat</a>.`
				: `No results found`;
		});
		
		window.addEventListener('popstate', scroll_anchor);
		
		document.querySelector('.banner > .nav-search').addEventListener('submit', event => event.preventDefault());
		
		break;
}