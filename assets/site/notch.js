/*!
 * VibeNotch island simulator.
 * A web port of the macOS app's IslandView: NotchShape.path(in:) line for line,
 * the same state rules (sizes, radii, offsets) and the same SwiftUI curves
 * (spring 0.45/0.75 for panels, easeOut 0.25 compact, easeOut 0.18 alerts).
 */
(() => {
    'use strict';

    // ── App constants (AppSettings defaults) ─────────────────────────────
    const NOTCH_H = 32;
    const BASE_H = NOTCH_H + 1;
    const SMALL_W = 172;
    const PHYS_W = Math.max(170, SMALL_W) + 20;
    const EXP_W = 380;
    const MUSIC_W = 243;
    const CORNER = 12;
    const CANVAS_W = 640;
    const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif';

    // Strings exactly as the app ships them (LocalizationManager + hard-coded labels).
    const STR = {
        es: { connected: 'CONECTADO', charging: 'Carga', silent: 'SILENCIO', on: 'Sí', network: 'Red', goal: '¡GOL!', goalBig: '¡GOOOOOOOOOOOOL!', team: 'España', pods: 'AirPods Pro', ssid: 'Casa',
            ev1: 'Lanzamiento VibeNotch', ev2: 'Diseño con el equipo', rem1: 'Grabar el anuncio', rem2: 'Subir a la App Store',
            tele: 'Hola a todos y bienvenidos. Hoy os enseño cómo VibeNotch convierte el notch de vuestro Mac en algo útil.', telePh: 'Escribe tu mensaje...' },
        en: { connected: 'CONNECTED', charging: 'Charging', silent: 'SILENT MODE', on: 'On', network: 'Network', goal: 'GOAL!', goalBig: 'GOOOOOOOOOOOAL!', team: 'Spain', pods: 'AirPods Pro', ssid: 'Home',
            ev1: 'VibeNotch launch', ev2: 'Design with the team', rem1: 'Record the ad', rem2: 'Ship the update',
            tele: 'Hi everyone and welcome. Today I’ll show you how VibeNotch turns your Mac’s notch into something useful.', telePh: 'Type your scrolling message...' },
        zh: { connected: '已连接', charging: '充电', silent: '静音模式', on: '开', network: '网络', goal: '进球！', goalBig: '进球啦啦啦啦啦！', team: '西班牙', pods: 'AirPods Pro', ssid: '家',
            ev1: 'VibeNotch 发布', ev2: '与团队一起设计', rem1: '录制广告', rem2: '上传到 App Store',
            tele: '大家好，欢迎收看。今天我来演示 VibeNotch 如何把 Mac 的刘海变得真正有用。', telePh: '输入你的滚动消息…' }
    };

    const TRACKS = [
        { title: 'Neon Echo', artist: 'Midnight Avenue', art: 'img', duration: 214, colors: ['#ffb26b', '#ff6b8b', '#9a5cff'] },
        { title: 'Golden Hour', artist: 'Lumen Coast', duration: 198, colors: ['#ffd27a', '#ff8a4c', '#ff4f6d'],
            art: 'radial-gradient(circle at 32% 34%, #fff1c2 0 13%, #ffd27a 14% 20%, transparent 21%), radial-gradient(120% 90% at 80% 110%, #6b1d5c 0, transparent 60%), linear-gradient(155deg, #ffb347 0%, #ff6a4d 48%, #8a1f5a 100%)' },
        { title: 'Ocean Drive', artist: 'Nova Bay', duration: 241, colors: ['#5ee7ff', '#3b82f6', '#7c3aed'],
            art: 'radial-gradient(circle at 70% 28%, #f4fdff 0 7%, transparent 8%), repeating-linear-gradient(172deg, rgb(255 255 255 / .16) 0 2px, transparent 2px 9px), linear-gradient(180deg, #38bdf8 0%, #1d4ed8 55%, #0b1235 100%)' }
    ];

    // ── Icons (SF Symbols look-alikes, drawn for this page) ─────────────
    const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
<symbol id="vni-back" viewBox="0 0 30 17"><path fill="currentColor" d="M14.6 2v13c0 1.1-1.2 1.7-2 1L1.5 9.4a1.2 1.2 0 0 1 0-1.8L12.6 1c.8-.7 2-.1 2 1Zm14.4 0v13c0 1.1-1.2 1.7-2 1L15.9 9.4a1.2 1.2 0 0 1 0-1.8L27 1c.8-.7 2-.1 2 1Z"/></symbol>
<symbol id="vni-fwd" viewBox="0 0 30 17"><path fill="currentColor" d="M15.4 2v13c0 1.1 1.2 1.7 2 1l11.1-6.6a1.2 1.2 0 0 0 0-1.8L17.4 1c-.8-.7-2-.1-2 1ZM1 2v13c0 1.1 1.2 1.7 2 1l11.1-6.6a1.2 1.2 0 0 0 0-1.8L3 1C2.2.3 1 .9 1 2Z"/></symbol>
<symbol id="vni-pause" viewBox="0 0 18 23"><rect x="0.5" y="0.5" width="6.2" height="22" rx="1.9" fill="currentColor"/><rect x="11.3" y="0.5" width="6.2" height="22" rx="1.9" fill="currentColor"/></symbol>
<symbol id="vni-play" viewBox="0 0 20 23"><path fill="currentColor" d="M1.5 2.2C1.5.9 2.9.1 4 .8l14.6 9.4c1 .6 1 2.1 0 2.7L4 22.2c-1.1.7-2.5-.1-2.5-1.4Z"/></symbol>
<symbol id="vni-stop" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" rx="2" fill="currentColor"/></symbol>
<symbol id="vni-gear" viewBox="-12 -12 24 24"><mask id="vni-gear-m"><rect x="-12" y="-12" width="24" height="24" fill="#fff"/><circle r="3.3" fill="#000"/></mask><g mask="url(#vni-gear-m)" fill="currentColor"><circle r="7.6"/><g id="vni-gear-t"><rect x="-1.9" y="-10.6" width="3.8" height="5" rx="1.3"/></g><use href="#vni-gear-t" transform="rotate(45)"/><use href="#vni-gear-t" transform="rotate(90)"/><use href="#vni-gear-t" transform="rotate(135)"/><use href="#vni-gear-t" transform="rotate(180)"/><use href="#vni-gear-t" transform="rotate(225)"/><use href="#vni-gear-t" transform="rotate(270)"/><use href="#vni-gear-t" transform="rotate(315)"/></g></symbol>
<symbol id="vni-cal" viewBox="0 0 20 18"><rect x="1" y="1" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M1 4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v1.6H1Z" fill="currentColor"/><g fill="currentColor"><circle cx="6" cy="8.6" r="1"/><circle cx="8.7" cy="8.6" r="1"/><circle cx="11.4" cy="8.6" r="1"/><circle cx="14.1" cy="8.6" r="1"/><circle cx="6" cy="11.3" r="1"/><circle cx="8.7" cy="11.3" r="1"/><circle cx="11.4" cy="11.3" r="1"/><circle cx="14.1" cy="11.3" r="1"/><circle cx="6" cy="14" r="1"/><circle cx="8.7" cy="14" r="1"/><circle cx="11.4" cy="14" r="1"/></g></symbol>
<symbol id="vni-tele" viewBox="0 0 20 16"><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 2h9M13.5 2h5M1.5 6h4M8.5 6h10M1.5 10h7M11.5 10h7M1.5 14h11M15.5 14h3"/></g></symbol>
<symbol id="vni-spark" viewBox="0 0 20 20"><path fill="currentColor" d="M11 4.5c.5 3.6 1.9 5 5.5 5.5-3.6.5-5 1.9-5.5 5.5-.5-3.6-1.9-5-5.5-5.5 3.6-.5 5-1.9 5.5-5.5ZM4.6 1c.25 1.7.9 2.35 2.6 2.6-1.7.25-2.35.9-2.6 2.6C4.35 4.5 3.7 3.85 2 3.6 3.7 3.35 4.35 2.7 4.6 1ZM4.4 14c.2 1.2.6 1.6 1.8 1.8-1.2.2-1.6.6-1.8 1.8-.2-1.2-.6-1.6-1.8-1.8 1.2-.2 1.6-.6 1.8-1.8Z"/></symbol>
<symbol id="vni-ballico" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="currentColor" d="m10 6.4 3.4 2.5-1.3 4h-4.2l-1.3-4Z"/><path stroke="currentColor" stroke-width="1.4" fill="none" d="M10 6.4V2M13.4 8.9l4-1.4M12.1 12.9l2.6 3.4M7.9 12.9l-2.6 3.4M6.6 8.9l-4-1.4"/></symbol>
<symbol id="vni-bell" viewBox="0 0 20 20"><path fill="currentColor" d="M10 1.5c.8 0 1.4.6 1.4 1.3v.5a5.6 5.6 0 0 1 4.2 5.4v3.6l1.7 2.2c.4.6 0 1.4-.7 1.4H3.4c-.7 0-1.1-.8-.7-1.4l1.7-2.2V8.7a5.6 5.6 0 0 1 4.2-5.4v-.5c0-.7.6-1.3 1.4-1.3Zm-2.3 15h4.6a2.3 2.3 0 0 1-4.6 0Z"/></symbol>
<symbol id="vni-batt" viewBox="0 0 25 12"><rect x=".75" y=".75" width="21" height="10.5" rx="3" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".55"/><rect x="2.4" y="2.4" width="17.7" height="7.2" rx="1.7" fill="currentColor"/><path d="M23.3 4.2c.8.2 1.2.9 1.2 1.8s-.4 1.6-1.2 1.8Z" fill="currentColor" opacity=".55"/></symbol>
<symbol id="vni-bolt" viewBox="0 0 14 22"><path fill="currentColor" d="M8.6.6c.3-.6-.4-1.1-.9-.7L.5 12c-.3.5 0 1.1.6 1.1h4.7l-1.4 8.2c-.1.7.7 1 1.1.5l7.4-12c.3-.5 0-1.1-.6-1.1H7.6Z"/></symbol>
<symbol id="vni-mute" viewBox="0 0 22 20"><path fill="currentColor" d="M10.6 1.4c.8-.6 1.9 0 1.9 1v15.2c0 1-1.1 1.6-1.9 1L5.8 15H2.6A1.6 1.6 0 0 1 1 13.4V6.6C1 5.7 1.7 5 2.6 5h3.2Z"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M2.6 1.6 20.4 18.4"/></symbol>
<symbol id="vni-wifi" viewBox="0 0 22 17"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M1.6 5.7a13.6 13.6 0 0 1 18.8 0"/><path d="M5 9.2a8.7 8.7 0 0 1 12 0"/><path d="M8.4 12.6a3.8 3.8 0 0 1 5.2 0"/></g><circle cx="11" cy="15.2" r="1.6" fill="currentColor"/></symbol>
<symbol id="vni-okc" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9.5" fill="currentColor"/><path d="m5.8 10.3 2.7 2.7 5.6-6" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/></symbol>
<symbol id="vni-chk" viewBox="0 0 10 10"><path d="m2 5.2 2 2 4-4.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="vni-list" viewBox="0 0 18 14"><g fill="currentColor"><circle cx="2" cy="2" r="1.5"/><circle cx="2" cy="7" r="1.5"/><circle cx="2" cy="12" r="1.5"/><rect x="5.5" y="1.1" width="12" height="1.8" rx=".9"/><rect x="5.5" y="6.1" width="12" height="1.8" rx=".9"/><rect x="5.5" y="11.1" width="12" height="1.8" rx=".9"/></g></symbol>
<symbol id="vni-calred" viewBox="0 0 18 16"><rect width="18" height="16" rx="3.2" fill="#ff3b30"/><g fill="#fff" opacity=".95"><rect x="0" y="0" width="18" height="4" rx="2" opacity=".0"/><circle cx="5" cy="7" r=".9"/><circle cx="7.7" cy="7" r=".9"/><circle cx="10.4" cy="7" r=".9"/><circle cx="13.1" cy="7" r=".9"/><circle cx="5" cy="9.8" r=".9"/><circle cx="7.7" cy="9.8" r=".9"/><circle cx="10.4" cy="9.8" r=".9"/><circle cx="13.1" cy="9.8" r=".9"/><circle cx="5" cy="12.5" r=".9"/><circle cx="7.7" cy="12.5" r=".9"/></g><rect x="2.5" y="2.6" width="13" height="1.3" rx=".65" fill="#fff" opacity=".9"/></symbol>
<symbol id="vni-spotify" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#34c759"/><g stroke="#000" stroke-width="1.5" stroke-linecap="round" opacity=".85"><path d="M5 8.5v3M7.5 6.5v7M10 4.8v10.4M12.5 7v6M15 8.8v2.4"/></g></symbol>
<symbol id="vni-lr" viewBox="0 0 20 12"><path d="M1.5 6h17M5.5 2 1.5 6l4 4M14.5 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="vni-film" viewBox="0 0 16 16"><rect x="1.5" y="1" width="13" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 1v14M11.5 1v14M1.5 5.5h3M1.5 10.5h3M11.5 5.5h3M11.5 10.5h3" stroke="currentColor" stroke-width="1.2"/></symbol>
<symbol id="vni-clip" viewBox="0 0 16 18"><rect x="4.5" y="4" width="10" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 2.6V2.5A1.5 1.5 0 0 0 9.5 1h-6A1.5 1.5 0 0 0 2 2.5v10A1.5 1.5 0 0 0 3.5 14" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
<symbol id="vni-trash" viewBox="0 0 14 16"><path fill="currentColor" d="M5 0h4a1 1 0 0 1 1 1v1h3.2a.8.8 0 0 1 0 1.6H.8a.8.8 0 0 1 0-1.6H4V1a1 1 0 0 1 1-1Zm-3 4.6h10l-.7 9.8A1.8 1.8 0 0 1 9.5 16h-5a1.8 1.8 0 0 1-1.8-1.6Z"/></symbol>
<symbol id="vni-turtle" viewBox="0 0 22 14"><path fill="currentColor" d="M3 9.3C3 5.2 6.4 2 10.5 2S18 5.2 18 9.3H3Zm15.3-2.6c.4-1 1.3-1.6 2.3-1.4.8.2 1.1 1.2.5 1.8-.6.6-1.6.8-2.6.6ZM4 10.3h2.2l-.4 2.5H3.5Zm11 0h2.2l.5 2.5h-2.3ZM2.5 10.3h16.5v.8H2.5Z"/></symbol>
<symbol id="vni-hare" viewBox="0 0 22 14"><path fill="currentColor" d="M4 7.5C4 5 7 3.5 10.5 3.5c2.3 0 4 .6 5.2 1.5L16 1.4c.1-.8 1.2-.9 1.4-.1l.6 3.3 2.3 1.6c.8.5.7 1.7-.2 2L17.5 9c-.4 2.3-2.6 3.8-6.3 3.8H5.6l-1.3 1H2.5l1.6-2.4C3.4 10.6 4 8.6 4 7.5Z"/></symbol>
<symbol id="vni-timer" viewBox="0 0 16 16"><circle cx="8" cy="8.5" r="6.3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 8.5 10.6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8 2.2V.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
<symbol id="vni-pods" viewBox="0 0 32 30"><g fill="#f4f4f6"><path d="M4 9.5C4 6 6.6 3.6 9.8 3.6c2.6 0 4.6 1.6 4.6 4.3 0 1.9-1 3.2-2.4 4v8.9a2.2 2.2 0 0 1-4.4 0v-7.3C5.4 12.9 4 11.5 4 9.5Z"/><path d="M28 9.5C28 6 25.4 3.6 22.2 3.6c-2.6 0-4.6 1.6-4.6 4.3 0 1.9 1 3.2 2.4 4v8.9a2.2 2.2 0 0 0 4.4 0v-7.3C26.6 12.9 28 11.5 28 9.5Z"/></g><g fill="#2b2b30"><circle cx="7.6" cy="9.4" r="2.2"/><circle cx="24.4" cy="9.4" r="2.2"/></g><g fill="#c7c7cc"><ellipse cx="12" cy="7" rx="1.2" ry=".9"/><ellipse cx="20" cy="7" rx="1.2" ry=".9"/></g></symbol>
<symbol id="vni-soccer" viewBox="0 0 32 32"><defs><radialGradient id="vni-sg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#e9e9ee"/><stop offset="1" stop-color="#b9b9c2"/></radialGradient><clipPath id="vni-sc"><circle cx="16" cy="16" r="15"/></clipPath></defs><circle cx="16" cy="16" r="15" fill="url(#vni-sg)"/><g clip-path="url(#vni-sc)" fill="#1d1d22"><path d="m16 10.4 5.3 3.9-2 6.2h-6.6l-2-6.2Z"/><path d="M13.2 0h5.6l-.6 3.8L16 5.2l-2.2-1.4Z"/><path d="m32 11.4-1.2 5.7-3.6-.5-1-2.6 1.8-3.5Z"/><path d="m25.7 29.4-5.2 2.4-1.2-3.6 1.6-2.3 3.9.3Z"/><path d="m6.3 29.4 5.2 2.4 1.2-3.6-1.6-2.3-3.9.3Z"/><path d="m0 11.4 1.2 5.7 3.6-.5 1-2.6-1.8-3.5Z"/></g><g clip-path="url(#vni-sc)" stroke="#1d1d22" stroke-width="1.1" fill="none" opacity=".75"><path d="M16 10.4V5.2M21.3 14.3l4.9-.3M19.3 20.5l2.4 4.3M12.7 20.5l-2.4 4.3M10.7 14.3l-4.9-.3"/></g></symbol>
<symbol id="vni-es" viewBox="0 0 30 20"><rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/><rect x="6.5" y="7.6" width="3.6" height="4.8" rx=".8" fill="#ad1519" opacity=".85"/></symbol>
<symbol id="vni-ar" viewBox="0 0 30 20"><rect width="30" height="20" fill="#74acdf"/><rect y="6.67" width="30" height="6.66" fill="#fff"/><circle cx="15" cy="10" r="2.2" fill="#f6b40e"/></symbol>
<symbol id="vni-app-safari" viewBox="0 0 16 16"><defs><linearGradient id="vni-saf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fc0ff"/><stop offset="1" stop-color="#1764e8"/></linearGradient></defs><rect x=".5" y=".5" width="15" height="15" rx="3.6" fill="#fff"/><circle cx="8" cy="8" r="6.1" fill="url(#vni-saf)"/><path d="m8 8 3.4-3.4L9 9.1Z" fill="#ff3b30"/><path d="m8 8-3.4 3.4L7 6.9Z" fill="#fff"/></symbol>
<symbol id="vni-app-shot" viewBox="0 0 16 16"><rect x=".5" y=".5" width="15" height="15" rx="3.6" fill="#f4f4f6"/><path d="M3.5 6V4.4c0-.5.4-.9.9-.9H6M10 3.5h1.6c.5 0 .9.4.9.9V6M12.5 10v1.6c0 .5-.4.9-.9.9H10M6 12.5H4.4a.9.9 0 0 1-.9-.9V10" fill="none" stroke="#3a3a3f" stroke-width="1" stroke-linecap="round"/><rect x="5.2" y="6.4" width="5.6" height="4.2" rx="1" fill="#3a3a3f"/><circle cx="8" cy="8.5" r="1.1" fill="#f4f4f6"/></symbol>
<symbol id="vni-app-notes" viewBox="0 0 16 16"><rect x=".5" y=".5" width="15" height="15" rx="3.6" fill="#fff"/><path d="M.5 4.1A3.6 3.6 0 0 1 4.1.5h7.8a3.6 3.6 0 0 1 3.6 3.6v1H.5Z" fill="#ffd60a"/><path d="M3 8h10M3 10.5h10M3 13h10" stroke="#d8d8dc" stroke-width=".7"/></symbol>
<symbol id="vni-app-booth" viewBox="0 0 16 16"><rect x=".5" y=".5" width="15" height="15" rx="3.6" fill="#e5463b"/><rect x="3.4" y="2.4" width="9.2" height="11.2" rx="1" fill="#f6f1ea"/><rect x="3.4" y="2.4" width="9.2" height="2" fill="#3a3a3f"/><circle cx="8" cy="8.2" r="1.6" fill="#c7b7a3"/><path d="M5.4 12.6c.3-1.8 1.3-2.6 2.6-2.6s2.3.8 2.6 2.6Z" fill="#c7b7a3"/></symbol>
<symbol id="vni-hw" viewBox="0 0 179 32"><path fill="currentColor" d="M0 0H179C175 0 173 2 173 6V23Q173 32 164 32H15Q6 32 6 23V6C6 2 4 0 0 0Z"/><circle cx="89.5" cy="16" r="3.2" fill="#0c0f16"/><circle cx="88.5" cy="15" r="1" fill="#1d2433"/></symbol>
</svg>`;

    const HELLO = [[0.18942, 0.64916], [0.27418, 0.51669, 0.27418, 0.51669, 0.23809, 0.59394], [0.30536, 0.34281, 0.30196, 0.45722, 0.31651, 0.37724], [0.24651, 0.67414, 0.26479, 0.21753, 0.24062, 0.67407], [0.28192, 0.5111, 0.2524, 0.6742, 0.25206, 0.54125], [0.32367, 0.53984, 0.31178, 0.48094, 0.3223, 0.52111], [0.31839, 0.6355, 0.32589, 0.57011, 0.31687, 0.61804], [0.43599, 0.55398, 0.32473, 0.70854, 0.42787, 0.63682], [0.3834, 0.61147, 0.44471, 0.46492, 0.3683, 0.46917], [0.4418, 0.66942, 0.38895, 0.66377, 0.42346, 0.67724], [0.552, 0.38575, 0.50813, 0.64115, 0.55363, 0.49671], [0.49571, 0.60864, 0.54988, 0.24203, 0.47856, 0.38729], [0.57499, 0.64351, 0.50232, 0.69393, 0.55841, 0.66619], [0.64978, 0.36314, 0.60564, 0.60157, 0.65966, 0.48059], [0.59745, 0.62607, 0.63947, 0.24062, 0.56181, 0.44249], [0.6548, 0.65717, 0.60934, 0.68733, 0.64502, 0.6666], [0.70474, 0.51817, 0.67802, 0.6348, 0.6855, 0.5536], [0.76896, 0.5601, 0.72906, 0.4734, 0.76738, 0.50686], [0.70263, 0.65105, 0.77246, 0.67742, 0.72159, 0.67749], [0.70448, 0.51817, 0.68627, 0.62823, 0.68244, 0.56022], [0.7753, 0.52099, 0.71954, 0.48942, 0.74363, 0.48871], [0.80807, 0.51063, 0.78825, 0.53419, 0.79935, 0.53183]];

    function helloPath(w, h) {
        const f = (v) => v.toFixed(2);
        let d = `M${f(HELLO[0][0] * w)} ${f(HELLO[0][1] * h)}`;
        for (let i = 1; i < HELLO.length; i++) {
            const [x, y, c1x, c1y, c2x, c2y] = HELLO[i];
            d += `C${f(c1x * w)} ${f(c1y * h)} ${f(c2x * w)} ${f(c2y * h)} ${f(x * w)} ${f(y * h)}`;
        }
        return d;
    }

    // ── NotchShape.path(in:) — Components/NotchShape.swift, 1:1 ─────────
    function notchPath(x0, y0, w, h, r, depth, bubble) {
        const X = (v) => (x0 + v).toFixed(2);
        const Y = (v) => (y0 + v).toFixed(2);
        if (w <= 0 || h <= 0) return 'M0 0Z';
        if (bubble) {
            const rr = Math.max(0, Math.min(r, h / 2, w / 2));
            return `M${X(rr)} ${Y(0)}H${X(w - rr)}A${rr} ${rr} 0 0 1 ${X(w)} ${Y(rr)}V${Y(h - rr)}A${rr} ${rr} 0 0 1 ${X(w - rr)} ${Y(h)}H${X(rr)}A${rr} ${rr} 0 0 1 ${X(0)} ${Y(h - rr)}V${Y(rr)}A${rr} ${rr} 0 0 1 ${X(rr)} ${Y(0)}Z`;
        }
        const side = 5;
        const radius = Math.max(0, Math.min(r, h, w / 2));
        const top = Math.min(h * 0.5, Math.max(side, depth));
        const compact = Math.abs(top - side) < 0.01;
        let d = `M${X(0)} ${Y(0)}L${X(w)} ${Y(0)}`;
        d += compact
            ? `Q${X(w - side)} ${Y(0)} ${X(w - side)} ${Y(side)}`
            : `C${X(w - side * 0.2)} ${Y(0)} ${X(w - side)} ${Y(top * 0.45)} ${X(w - side)} ${Y(top)}`;
        d += `L${X(w - side)} ${Y(h - radius)}`;
        d += `A${radius} ${radius} 0 0 1 ${X(w - side - radius)} ${Y(h)}`;
        d += `L${X(side + radius)} ${Y(h)}`;
        d += `A${radius} ${radius} 0 0 1 ${X(side)} ${Y(h - radius)}`;
        d += `L${X(side)} ${Y(top)}`;
        d += compact
            ? `Q${X(side)} ${Y(0)} ${X(0)} ${Y(0)}`
            : `C${X(side)} ${Y(top * 0.45)} ${X(side * 0.2)} ${Y(0)} ${X(0)} ${Y(0)}`;
        return d + 'Z';
    }

    // ── SwiftUI animation curves ────────────────────────────────────────
    function bezier(x1, y1, x2, y2) {
        const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
        const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
        const sx = (t) => ((ax * t + bx) * t + cx) * t;
        const sy = (t) => ((ay * t + by) * t + cy) * t;
        const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
        return (x) => {
            if (x <= 0) return 0;
            if (x >= 1) return 1;
            let t = x;
            for (let i = 0; i < 8; i++) {
                const e = sx(t) - x;
                if (Math.abs(e) < 1e-5) break;
                const d = dx(t);
                if (Math.abs(d) < 1e-6) break;
                t -= e / d;
            }
            return sy(Math.min(1, Math.max(0, t)));
        };
    }

    const EASE_OUT = bezier(0, 0, 0.58, 1);
    const spring = (response, damping) => ({ type: 'spring', k: (2 * Math.PI / response) ** 2, c: (4 * Math.PI * damping) / response });
    const easeOut = (duration) => ({ type: 'ease', duration, curve: EASE_OUT });
    const PANEL_SPRING = spring(0.45, 0.75);
    const OFFSET_SPRING = spring(0.5, 0.7);

    class Prop {
        constructor(value) {
            this.v = value;
            this.target = value;
            this.vel = 0;
            this.anim = null;
        }

        to(target, anim, now) {
            if (anim && Math.abs(target - this.target) < 1e-4) return;
            this.target = target;
            if (!anim) {
                this.v = target;
                this.vel = 0;
                this.anim = null;
                return;
            }
            this.anim = anim;
            this.from = this.v;
            this.start = now;
        }

        step(now, dt) {
            if (!this.anim) return false;
            const prev = this.v;
            if (this.anim.type === 'ease') {
                const t = (now - this.start) / (this.anim.duration * 1000);
                this.v = this.from + (this.target - this.from) * this.anim.curve(Math.min(1, t));
                this.vel = dt > 0 ? (this.v - prev) / dt : 0;
                if (t >= 1) {
                    this.v = this.target;
                    this.vel = 0;
                    this.anim = null;
                }
                return true;
            }
            const { k, c } = this.anim;
            let left = Math.min(dt, 0.064);
            while (left > 0) {
                const h = Math.min(left, 1 / 480);
                const a = -k * (this.v - this.target) - c * this.vel;
                this.vel += a * h;
                this.v += this.vel * h;
                left -= h;
            }
            if (Math.abs(this.v - this.target) < 0.01 && Math.abs(this.vel) < 0.05) {
                this.v = this.target;
                this.vel = 0;
                this.anim = null;
            }
            return true;
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────
    const icon = (id, w, h, extra = '') => `<svg width="${w}" height="${h}" ${extra} aria-hidden="true"><use href="#vni-${id}"/></svg>`;
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fmt = (s) => {
        s = Math.max(0, Math.round(s));
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };
    let measureCtx = null;
    function textWidth(text, font = `600 13px ${FONT}`) {
        measureCtx = measureCtx || document.createElement('canvas').getContext('2d');
        measureCtx.font = font;
        return measureCtx.measureText(text).width;
    }
    function hashString(s) {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
        return Math.abs(h);
    }

    function injectSprite() {
        if (document.getElementById('vni-sprite')) return;
        const holder = document.createElement('div');
        holder.id = 'vni-sprite';
        holder.innerHTML = SPRITE;
        document.body.prepend(holder);
    }

    const NOTIF_DURATION = { welcome: 3.0, goal: 5.5 };

    // ── The island ──────────────────────────────────────────────────────
    class VibeIsland {
        constructor(host, options = {}) {
            this.host = host;
            this.opts = Object.assign({ art: '/assets/optimized/album-art-256.jpg', lang: 'es', fit: 530, maxScale: 1.75, minScale: 0.5 }, options);
            this.listeners = {};
            this.state = {
                mode: 'notch', glass: true, expanded: false, panel: 'media', disco: false,
                playing: true, track: 0, elapsed: 61, notif: null,
                teleMode: 0, teleRunning: false, countdown: 0,
                score: [1, 1], minute: 78, reminders: [false, false], live: false
            };
            this.lang = STR[this.opts.lang] ? this.opts.lang : 'es';
            this.teleText = STR[this.lang].tele;
            this.teleEdited = false;
            this.bgOpacity = 0;
            this.lastClose = 0;
            this.visible = true;
            this.raf = 0;
            this.last = 0;
            const now = performance.now();
            this.p = { w: new Prop(PHYS_W), h: new Prop(BASE_H), r: new Prop(CORNER), d: new Prop(5), y: new Prop(0), pulse: new Prop(1) };
            this.p.pulse.v = 1;
            this.loop = this.loop.bind(this);
            injectSprite();
            this.build();
            this.bind();
            this.update(true);
            this.tick(now);
            this.startClocks();
        }

        on(event, fn) {
            (this.listeners[event] = this.listeners[event] || []).push(fn);
            return this;
        }

        emit(event, detail) {
            (this.listeners[event] || []).forEach((fn) => fn(detail));
        }

        get t() {
            return STR[this.lang];
        }

        get track() {
            return TRACKS[this.state.track];
        }

        // ── DOM ─────────────────────────────────────────────────────────
        build() {
            const root = document.createElement('div');
            root.className = 'vni';
            root.innerHTML = `
                <svg class="vni-hw" viewBox="0 0 179 32" aria-hidden="true"><use href="#vni-hw"/></svg>
                <div class="vni-hit" aria-hidden="true"></div>
                <div class="vni-pulse">
                    <div class="vni-surface">
                        <div class="vni-glow"></div>
                        <div class="vni-glass"></div>
                        <div class="vni-fill"></div>
                        <div class="vni-view vni-panel vni-sports-bg" data-v="sportsbg">${this.pitchHTML()}</div>
                        <div class="vni-view vni-compact" data-v="compact"></div>
                        <div class="vni-view vni-panel vni-media" data-v="media"></div>
                        <div class="vni-view vni-panel vni-events" data-v="events"></div>
                        <div class="vni-view vni-panel vni-tele" data-v="tele"></div>
                        <div class="vni-view vni-panel vni-sports" data-v="sports"></div>
                        <div class="vni-view" data-v="header"></div>
                        <div class="vni-view vni-quick-overlay" data-v="quick"></div>
                        <div class="vni-view is-quick vni-notif" data-v="notif"></div>
                    </div>
                </div>`;
            this.host.appendChild(root);
            this.root = root;
            this.$ = (sel) => root.querySelector(sel);
            this.views = {};
            root.querySelectorAll('[data-v]').forEach((el) => { this.views[el.dataset.v] = el; });
            this.pulseEl = this.$('.vni-pulse');
            this.surface = this.$('.vni-surface');
            this.fill = this.$('.vni-fill');
            this.glass = this.$('.vni-glass');
            this.glow = this.$('.vni-glow');
            this.hit = this.$('.vni-hit');
            this.renderContent();
            if ('ResizeObserver' in window) {
                this.ro = new ResizeObserver(() => this.fit());
                this.ro.observe(this.host);
            }
            this.fit();
            if ('IntersectionObserver' in window) {
                this.io = new IntersectionObserver((entries) => {
                    this.visible = entries[0].isIntersecting;
                    if (this.visible) this.startClocks();
                    else this.stopClocks();
                }, { rootMargin: '120px' });
                this.io.observe(this.host);
            }
        }

        fit() {
            const w = this.host.clientWidth || 0;
            const base = Math.max(this.opts.minScale, Math.min(this.opts.maxScale, w / this.opts.fit));
            this.baseScale = base;
            const s = base * (this.zoom || 1);
            this.scale = s;
            this.root.style.setProperty('--vni-scale', s.toFixed(4));
            this.emit('scale', s);
        }

        // Spotlight the shortcut apps one after another.
        highlightQuick(on) {
            this.root.classList.toggle('is-quick-hl', !!on);
        }

        // Zoom on top of the fitted scale (animated by CSS when asked to).
        setZoom(zoom, animate = true) {
            if (Math.abs((this.zoom || 1) - zoom) < 0.01) return;
            this.zoom = zoom;
            this.root.classList.toggle('is-zooming', !!animate);
            this.fit();
        }

        artStyle(track = this.track) {
            return track.art === 'img' ? `background-image:url('${this.opts.art}')` : `background-image:${track.art}`;
        }

        waveHTML(id) {
            return `<div class="vni-wave" data-wave="${id}"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
        }

        quickHTML() {
            return `<div class="vni-quick">
                <button class="vni-qa vni-interactive" type="button" aria-label="Safari">${icon('app-safari', 16, 16)}</button>
                <button class="vni-qa vni-interactive" type="button" aria-label="Screenshot">${icon('app-shot', 16, 16)}</button>
                <button class="vni-qa vni-interactive" type="button" aria-label="Notes">${icon('app-notes', 16, 16)}</button>
                <button class="vni-qa vni-interactive" type="button" aria-label="Photo Booth">${icon('app-booth', 16, 16)}</button>
            </div>`;
        }

        pitchHTML() {
            return `<div class="vni-pitch"><svg viewBox="0 0 380 203" preserveAspectRatio="none" aria-hidden="true">
                <g fill="none" stroke="rgb(255 255 255 / .38)" stroke-width="1.1">
                    <path d="M0 97H380"/><ellipse cx="190" cy="97" rx="65" ry="19.5"/>
                    <path d="M116 46 26 203M266 46 356 203"/>
                </g>
                <text x="100" y="168" font-family="${FONT}" font-weight="800" font-size="42" fill="rgb(255 255 255 / .1)" transform="rotate(-12 100 168)" text-anchor="middle">2026</text>
                <g opacity=".16" transform="translate(324 160) rotate(-8)"><circle r="76" fill="#fff"/><g fill="#0d3a12"><path d="m0-20 19 14-7 22h-24l-7-22Z"/><path d="m-11-68 22 0-3 16-8 6-8-6Z"/><path d="m60-30 6 25-15 4-7-11 6-15Z"/><path d="m-60-30-6 25 15 4 7-11-6-15Z"/></g></g>
            </svg><div class="vni-pitch-fade"></div></div>
            <div class="vni-celebrate"><div class="vni-confetti">${Array.from({ length: 34 }, (_, i) => {
                const colors = ['#ffd60a', '#ff453a', '#34c759', '#0a84ff', '#fff', '#bf5af2'];
                const left = (i * 37) % 380;
                return `<i style="left:${left}px;background:${colors[i % colors.length]};--x:${((i * 53) % 90) - 45}px;--r:${360 + (i * 47) % 400}deg;--d:${1.8 + (i % 5) * 0.25}s;--delay:${(i % 7) * 0.07}s"></i>`;
            }).join('')}</div><div class="vni-goal-marquee"></div></div>`;
        }

        renderContent() {
            const t = this.t;
            const tr = this.track;
            const bubble = this.state.mode === 'bubble';
            const v = this.views;

            v.compact.innerHTML = `<div class="vni-art vni-art-s" style="${this.artStyle()}"></div>${this.waveHTML('c')}`;
            v.compact.classList.toggle('vni-bubble-compact', bubble);

            const controls = `<div class="vni-controls">
                    <button class="vni-ctl vni-interactive" type="button" data-act="prev" aria-label="Previous" style="width:28px;height:28px">${icon('back', 26.5, 15)}</button>
                    <button class="vni-ctl vni-interactive" type="button" data-act="play" aria-label="Play/Pause" style="width:36px;height:36px">${this.state.playing ? icon('pause', 17.7, 22.6) : icon('play', 19, 22.6)}</button>
                    <button class="vni-ctl vni-interactive" type="button" data-act="next" aria-label="Next" style="width:28px;height:28px">${icon('fwd', 26.5, 15)}</button>
                </div>`;
            v.media.innerHTML = `
                <div class="vni-art vni-art-l" style="${this.artStyle()}"></div>
                <div class="vni-info">
                    <div class="vni-np"><span class="vni-np-icon">${icon('spotify', 10, 10)}</span><span class="vni-np-label">${this.state.playing ? 'NOW PLAYING' : 'PAUSED'}</span>${this.waveHTML('m')}</div>
                    <div class="vni-title">${esc(tr.title)}</div>
                    <div class="vni-artist">${esc(tr.artist)}</div>
                    <div class="vni-progress"><div class="vni-track vni-interactive" data-act="seek"><div class="vni-track-fill"></div><div class="vni-knob"></div></div><div class="vni-time"></div></div>
                </div>
                <div class="vni-spacer"></div>
                ${bubble ? `<div class="vni-right-col">${controls}${this.quickHTML()}</div>` : controls}`;

            const day = new Date();
            const dateLabel = day.toLocaleDateString(this.lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
            const rem = (i, title) => `<button class="vni-rem vni-interactive${this.state.reminders[i] ? ' is-done' : ''}" type="button" data-act="rem" data-i="${i}">
                    <span class="vni-rem-check"><i>${icon('chk', 8, 8)}</i></span>
                    <span><span class="vni-rem-title">${esc(title)}</span><span class="vni-rem-date">${esc(dateLabel)}</span></span>
                </button>`;
            v.events.innerHTML = `
                <div class="vni-ev-col">
                    <div class="vni-ev-head">${icon('calred', 11, 10)}<span>EVENTS</span></div>
                    <div class="vni-ev-list">
                        <div class="vni-ev"><div class="vni-ev-when"><span class="vni-ev-day">TODAY</span><span class="vni-ev-time">10:00</span><i class="vni-ev-bar" style="background:#34c759"></i></div><div class="vni-ev-title">${esc(t.ev1)}</div></div>
                        <div class="vni-ev"><div class="vni-ev-when"><span class="vni-ev-day">TODAY</span><span class="vni-ev-time">13:00</span><i class="vni-ev-bar" style="background:#0a84ff"></i></div><div class="vni-ev-title">${esc(t.ev2)}</div></div>
                    </div>
                </div>
                <div class="vni-ev-divider"></div>
                <div class="vni-ev-col">
                    <div class="vni-ev-head"><span style="color:var(--vni-blue)">${icon('list', 12, 10)}</span><span>REMINDERS</span></div>
                    <div class="vni-ev-list is-rem">${rem(0, t.rem1)}${rem(1, t.rem2)}</div>
                </div>`;

            this.renderTele();
            this.renderSports();
            this.renderHeader();
            v.quick.innerHTML = bubble ? '' : this.quickHTML();
            this.renderNotif();
            this.syncMedia();
            this.applyWaveColors();
        }

        renderTele() {
            const s = this.state;
            const len = this.teleText.length;
            const color = s.teleMode === 0 ? 'var(--vni-cyan)' : 'var(--vni-purple)';
            this.views.tele.style.setProperty('--aurora', color);
            this.views.tele.innerHTML = `
                <div class="vni-tp-edit">
                    <div class="vni-tp-tabs">
                        <button class="vni-tp-tab vni-interactive${s.teleMode === 0 ? ' is-on' : ''}" type="button" data-act="tmode" data-mode="0">${icon('lr', 12, 8)}TICKER</button>
                        <button class="vni-tp-tab vni-interactive${s.teleMode === 1 ? ' is-on' : ''}" type="button" data-act="tmode" data-mode="1">${icon('film', 10, 10)}CRÉDITOS</button>
                    </div>
                    <div class="vni-tp-editor">
                        <textarea class="vni-tp-text" spellcheck="false" maxlength="240" aria-label="Teleprompter" placeholder="${esc(this.t.telePh)}">${esc(this.teleText)}</textarea>
                        <span class="vni-tp-paste">${icon('clip', 9, 10)}PEGAR</span>
                        <span class="vni-tp-count">${len}</span>
                        <span class="vni-tp-trash">${icon('trash', 8, 9)}</span>
                    </div>
                    <div class="vni-tp-bar">
                        ${icon('turtle', 13, 9)}
                        <span class="vni-tp-slider" style="--v:.28"><i></i></span>
                        ${icon('hare', 13, 9)}
                        <span class="vni-tp-speed">40</span>
                        <span class="vni-tp-timer">${icon('timer', 9, 9)}3s</span>
                        <button class="vni-tp-play vni-interactive" type="button" data-act="tplay" style="${s.teleMode === 1 ? 'background:var(--vni-purple)' : ''}">${icon('play', 9, 10)}VER</button>
                    </div>
                </div>
                <div class="vni-tp-stage">
                    <div class="vni-aurora"><i></i><i></i><i></i></div>
                    <div class="vni-count"></div>
                    <div class="vni-ticker"><span></span></div>
                    <button class="vni-tp-stop vni-interactive" type="button" data-act="tstop">${icon('stop', 7, 7)}STOP</button>
                </div>`;
            const area = this.views.tele.querySelector('textarea');
            area.addEventListener('input', () => {
                this.teleText = area.value;
                this.teleEdited = true;
                this.views.tele.querySelector('.vni-tp-count').textContent = area.value.length;
            });
            area.addEventListener('pointerdown', (e) => e.stopPropagation());
        }

        renderSports() {
            const s = this.state;
            const t = this.t;
            const leagues = ['LaLiga', 'Premier League', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League', 'NBA', 'NFL', 'Fórmula 1', 'ATP Tour', 'UFC', 'MLB'];
            const chip = (name, i) => `<span class="vni-league">${i < 6 ? '⚽ ' : ''}${name}</span>`;
            const row = leagues.map(chip).join('');
            const marks = (list) => list.map((m) => `<span class="vni-team-mark">⚽ ${m}'</span>`).join('');
            const home = s.score[0] > 1 ? ['23', '81'] : ['23'];
            this.views.sports.innerHTML = `
                <div class="vni-leagues"><div class="vni-leagues-row">${row}${row}</div></div>
                <div class="vni-score-row">
                    <div class="vni-team" style="left:57px">${icon('es', 27, 19)}<span>ESP</span></div>
                    <div class="vni-team" style="left:323px">${icon('ar', 27, 19)}<span>ARG</span></div>
                    <div class="vni-marks" style="left:22px">${marks(home)}</div>
                    <div class="vni-marks" style="right:22px;align-items:flex-end">${marks(['54'])}</div>
                    <div class="vni-score"><b data-score="0">${s.score[0]}</b> – <b data-score="1">${s.score[1]}</b></div>
                    <div class="vni-clock"><i></i><span>${s.minute}'</span></div>
                    <div class="vni-timeline"><span>⚽</span><i></i><i></i><i></i><i></i><i></i><i class="is-now"></i><i></i><i></i><i></i></div>
                </div>`;
            this.views.sportsbg.querySelector('.vni-goal-marquee').textContent = t.goalBig;
        }

        renderHeader() {
            const s = this.state;
            const bubble = s.mode === 'bubble';
            const sports = s.panel === 'sports';
            const chip = (id, label, tint, on, act, dot) => `<button class="vni-chip vni-interactive${on ? ' is-on' : ''}" type="button" data-act="${act}" style="--tint:${tint}">${icon(id, 20, bubble ? 15 : 16)}<span>${label}</span>${dot ? `<i class="vni-dot" style="--dot:${dot}"></i>` : ''}</button>`;
            const chips = `${s.live ? chip('ballico', 'LIVE', 'var(--vni-green)', sports, 'p-sports', 'var(--vni-red)') : ''}${chip('cal', 'EVENT', 'var(--vni-blue)', s.panel === 'events', 'p-events')}${chip('tele', 'TELE', 'var(--vni-cyan)', s.panel === 'tele', 'p-tele', s.teleRunning ? 'var(--vni-cyan)' : '')}${chip('spark', 'DISCO', 'var(--vni-purple)', s.disco, 'disco')}`;
            const gear = sports
                ? `<span class="vni-gear">${icon('bell', 14, 14)}</span>`
                : `<button class="vni-gear vni-interactive" type="button" aria-label="Settings">${icon('gear', 15, 15)}</button>`;
            const head = this.views.header;
            if (bubble) {
                head.className = `vni-view vni-bubble-header${head.classList.contains('is-on') ? ' is-on' : ''}`;
                head.innerHTML = `<div class="vni-left-bubble">${gear}<span class="vni-bubble-batt">${icon('batt', 23, 11, 'style="color:rgb(255 255 255 / .75)"')}82%</span></div>
                    <div class="vni-chips"><div class="vni-chips-row">${chips}</div></div>`;
            } else {
                head.className = `vni-view vni-header${head.classList.contains('is-on') ? ' is-on' : ''}`;
                head.innerHTML = `<div class="vni-left"><span class="vni-batt">${icon('batt', 12.5, 6)}82%</span>${gear}</div>
                    <div class="vni-chips"><div class="vni-chips-row">${chips}</div></div>`;
            }
            this.chipsRow = head.querySelector('.vni-chips-row');
            this.slideChips(true);
        }

        slideChips(reset) {
            if (!this.chipsRow || this.state.mode === 'bubble') {
                if (this.chipsRow) this.chipsRow.style.transform = '';
                return;
            }
            // StatusChipsCarousel: a two-chip window over the row; it rests where
            // the selected chip is visible (the app slides it end to end every 3.5 s).
            const order = (this.state.live ? ['sports'] : []).concat(['events', 'tele', 'disco']);
            const maxShift = order.length * 44 - 4 - 84;
            const index = Math.max(0, order.indexOf(this.state.panel));
            const shift = Math.min(maxShift, Math.max(0, (index - 1) * 44));
            this.chipsRow.style.transform = `translateX(${-shift}px)`;
        }

        renderNotif() {
            const n = this.state.notif;
            const v = this.views.notif;
            const t = this.t;
            v.classList.remove('vni-hello', 'is-play');
            if (!n) return;
            const wing = (l, r, lp = 12, rp = 12) => `<div class="vni-wing" style="padding-left:${lp}px">${l}</div><div class="vni-gap"></div><div class="vni-wing vni-wing-r" style="padding-right:${rp}px">${r}</div>`;
            switch (n.type) {
                case 'airpods':
                    v.innerHTML = wing(`<span class="vni-airpods">${icon('pods', 30, 28)}</span>`,
                        `<div class="vni-stack" style="align-items:flex-end;gap:1px"><span class="vni-cap" style="font-size:8.5px;letter-spacing:.6px;color:rgb(52 199 89 / .9);display:flex;align-items:center;gap:4px">${t.connected}<i style="width:4px;height:4px;border-radius:50%;background:var(--vni-green)"></i></span><span class="vni-mid" style="width:150px">${t.pods}</span></div>`, 10, 12);
                    break;
                case 'charging':
                    v.innerHTML = wing(`<div style="display:flex;align-items:center;gap:12px"><span style="color:var(--vni-green)">${icon('bolt', 11, 18)}</span><div class="vni-stack"><span class="vni-cap">${t.charging.toUpperCase()}</span><span class="vni-big">82%</span></div></div>`,
                        `<span class="vni-battery-ind"><i style="width:${(28 * 0.82).toFixed(1)}px"></i></span>`, 18, 18);
                    break;
                case 'silent':
                    v.innerHTML = wing(`<div style="display:flex;align-items:center;gap:12px"><span style="color:var(--vni-red)">${icon('mute', 21, 19)}</span><div class="vni-stack" style="gap:2px"><span class="vni-cap" style="font-size:9px;line-height:11px">${t.silent}</span><span class="vni-mid">${t.on}</span></div></div>`,
                        `<i style="width:30px;height:6px;border-radius:3px;background:var(--vni-red)"></i>`);
                    break;
                case 'wifi':
                    v.innerHTML = wing(`<div style="display:flex;align-items:center;gap:12px"><span style="color:var(--vni-blue)">${icon('wifi', 22, 17)}</span><div class="vni-stack" style="gap:2px"><span class="vni-cap" style="font-size:9px;line-height:11px">${t.network.toUpperCase()}</span><span class="vni-mid">${esc(t.ssid)}</span></div></div>`,
                        `<span style="color:var(--vni-green)">${icon('okc', 18, 18)}</span>`);
                    break;
                case 'goal':
                    v.innerHTML = wing(`<div style="display:flex;align-items:center;gap:9px">${icon('soccer', 26, 26, 'class="vni-goal-ball"')}<div class="vni-stack"><span class="vni-goal-title">${t.goal}</span><span class="vni-goal-team">${icon('es', 13, 9)}${esc(t.team)}</span></div></div>`,
                        `<div class="vni-goal-score">${icon('es', 20, 14)}<span>${n.score}</span>${icon('ar', 20, 14)}</div>`, 14, 14);
                    break;
                case 'welcome': {
                    v.classList.add('vni-hello');
                    v.innerHTML = `<svg viewBox="0 0 290 145" aria-hidden="true"><path d="${helloPath(290, 145)}"/></svg>`;
                    const path = v.querySelector('path');
                    const len = path.getTotalLength();
                    path.style.strokeDasharray = `${len}`;
                    path.style.strokeDashoffset = `${len}`;
                    requestAnimationFrame(() => v.classList.add('is-play'));
                    break;
                }
                default:
                    v.innerHTML = '';
            }
        }

        // ── Behaviour ──────────────────────────────────────────────────
        bind() {
            const root = this.root;
            const isMouse = (e) => e.pointerType === 'mouse';
            // pointerenter/leave reach the root through its hit area and its
            // interactive children, so hovering a button never collapses it.
            root.addEventListener('pointerenter', (e) => {
                if (!isMouse(e) || this.locked) return;
                clearTimeout(this.hoverTimer);
                if (performance.now() - this.lastClose < 200) return;
                const delay = this.state.mode === 'bubble' ? 40 : 100;
                this.hoverTimer = setTimeout(() => this.expand(true, 'hover'), delay);
            });
            root.addEventListener('pointerleave', (e) => {
                if (!isMouse(e)) return;
                clearTimeout(this.hoverTimer);
                if (this.isTeleLive || this.locked) return;
                if (this.state.expanded) this.lastClose = performance.now();
                this.expand(false, 'hover');
            });
            this.hit.addEventListener('click', (e) => {
                if (e.pointerType === 'mouse' && !this.opts.clickToExpand) return;
                this.expand(!this.state.expanded, 'tap');
            });
            root.addEventListener('click', (e) => {
                const el = e.target.closest('[data-act]');
                if (!el) return;
                e.stopPropagation();
                this.action(el.dataset.act, el, e);
            });
            this.outside = (e) => {
                if (!this.state.expanded || this.locked || e.pointerType === 'mouse') return;
                if (root.contains(e.target)) return;
                if (e.target.closest && e.target.closest('[data-island-control]')) return;
                this.expand(false, 'tap');
            };
            document.addEventListener('pointerdown', this.outside, { passive: true });
        }

        action(act, el, e) {
            const s = this.state;
            switch (act) {
                case 'play': this.togglePlay(); break;
                case 'next': this.skip(1); break;
                case 'prev': this.skip(-1); break;
                case 'seek': {
                    const r = el.getBoundingClientRect();
                    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
                    s.elapsed = p * this.track.duration;
                    this.syncMedia();
                    break;
                }
                case 'p-events': this.show(s.panel === 'events' ? 'media' : 'events'); break;
                case 'p-tele': this.show(s.panel === 'tele' ? 'media' : 'tele'); break;
                case 'p-sports': this.show(s.panel === 'sports' ? 'media' : 'sports'); break;
                case 'disco': this.setDisco(!s.disco); break;
                case 'rem': {
                    const i = +el.dataset.i;
                    s.reminders[i] = !s.reminders[i];
                    el.classList.toggle('is-done', s.reminders[i]);
                    break;
                }
                case 'tmode':
                    s.teleMode = +el.dataset.mode;
                    this.renderTele();
                    break;
                case 'tplay': this.startTeleprompter(); break;
                case 'tstop': this.stopTeleprompter(); break;
                default:
            }
            this.emit('change', this.snapshot());
        }

        snapshot() {
            const s = this.state;
            return { mode: s.mode, glass: s.glass, expanded: s.expanded, panel: s.panel, disco: s.disco, playing: s.playing, notif: s.notif && s.notif.type, teleRunning: s.teleRunning };
        }

        get isTeleLive() {
            const s = this.state;
            return s.panel === 'tele' && (s.teleRunning || s.countdown > 0);
        }

        expand(on, source = 'api') {
            const s = this.state;
            if (s.expanded === on) return;
            s.expanded = on;
            if (on) {
                clearTimeout(this.resetPanelTimer);
            } else {
                if (s.teleRunning || s.countdown) this.stopTeleprompter(true);
                // RESET STATE ON CLOSE: the calendar is hidden for the next open
                this.resetPanelTimer = setTimeout(() => {
                    if (!s.expanded && s.panel === 'events') {
                        s.panel = 'media';
                        this.renderHeader();
                        this.update();
                    }
                }, 350);
            }
            this.update();
            this.emit('change', Object.assign(this.snapshot(), { source }));
        }

        show(panel, expand = true) {
            const s = this.state;
            if (panel === 'sports') s.live = true;
            s.panel = panel;
            if (panel !== 'tele' && (s.teleRunning || s.countdown)) this.stopTeleprompter(true);
            this.renderHeader();
            if (expand) s.expanded = true;
            this.update();
            this.emit('change', this.snapshot());
        }

        setMode(mode) {
            if (this.state.mode === mode) return;
            this.state.mode = mode;
            this.renderContent();
            this.update();
            this.emit('change', this.snapshot());
        }

        setGlass(on) {
            this.state.glass = !!on;
            this.update();
            this.emit('change', this.snapshot());
        }

        setLive(on) {
            this.state.live = !!on;
            if (!on && this.state.panel === 'sports') this.state.panel = 'media';
            this.renderHeader();
            this.update();
        }

        setDisco(on) {
            this.state.disco = !!on;
            this.renderHeader();
            this.update();
            this.emit('change', this.snapshot());
        }

        setLang(lang) {
            if (!STR[lang] || lang === this.lang) return;
            this.lang = lang;
            if (!this.teleEdited) this.teleText = STR[lang].tele;
            this.renderContent();
            this.update();
        }

        togglePlay() {
            this.state.playing = !this.state.playing;
            this.renderContent();
            this.update();
            this.emit('change', this.snapshot());
        }

        skip(dir) {
            const s = this.state;
            if (dir < 0 && s.elapsed > 3) {
                s.elapsed = 0;
            } else {
                s.track = (s.track + dir + TRACKS.length) % TRACKS.length;
                s.elapsed = 0;
            }
            this.renderContent();
            this.update();
        }

        notify(type, opts = {}) {
            const s = this.state;
            clearTimeout(this.notifTimer);
            if (type === 'goal') {
                s.score = [s.score[0] + 1, s.score[1]];
                s.minute = Math.min(90, s.minute + 3);
                opts.score = `${s.score[0]} – ${s.score[1]}`;
                this.renderSports();
                if (s.expanded && s.panel === 'sports') this.celebrate();
            }
            s.notif = Object.assign({ type, id: Date.now() }, opts);
            this.renderNotif();
            this.update();
            const duration = (NOTIF_DURATION[type] || 4.0) * 1000;
            if (opts.hold) return;
            this.notifTimer = setTimeout(() => {
                s.notif = null;
                this.update();
                this.emit('change', this.snapshot());
            }, duration);
            this.emit('change', this.snapshot());
        }

        celebrate() {
            const el = this.views.sportsbg.querySelector('.vni-celebrate');
            el.classList.remove('is-on');
            void el.offsetWidth;
            el.classList.add('is-on');
            const b = this.views.sports.querySelector('[data-score="0"]');
            if (b) b.classList.add('is-bump');
            clearTimeout(this.celebrateTimer);
            this.celebrateTimer = setTimeout(() => el.classList.remove('is-on'), 3200);
        }

        startTeleprompter() {
            const s = this.state;
            const stage = this.views.tele;
            s.countdown = 3;
            stage.classList.add('is-running');
            this.renderHeader();
            const count = stage.querySelector('.vni-count');
            const ticker = stage.querySelector('.vni-ticker');
            ticker.style.display = 'none';
            const step = () => {
                if (!s.countdown) return;
                count.innerHTML = `<i>${s.countdown}</i><b>${s.countdown}</b>`;
                this.countTimer = setTimeout(() => {
                    s.countdown -= 1;
                    if (s.countdown > 0) step();
                    else this.runTicker();
                }, 900);
            };
            step();
            this.emit('change', this.snapshot());
        }

        runTicker() {
            const s = this.state;
            const stage = this.views.tele;
            s.teleRunning = true;
            this.renderHeader();
            stage.querySelector('.vni-count').innerHTML = '';
            const ticker = stage.querySelector('.vni-ticker');
            const span = ticker.querySelector('span');
            ticker.style.display = '';
            const text = (this.teleText || '···').replace(/\n/g, '   •   ');
            span.textContent = `${text}${' '.repeat(14)}${text}`;
            const width = ticker.clientWidth || 330;
            const loop = textWidth(text, `700 20px ${FONT}`) + 80;
            let x = width;
            let last = performance.now();
            const speed = 40;
            const frame = (now) => {
                if (!s.teleRunning) return;
                x -= speed * Math.min(0.05, (now - last) / 1000);
                last = now;
                if (x < -loop) x += loop;
                span.style.transform = `translateX(${x.toFixed(1)}px)`;
                this.tickerRaf = requestAnimationFrame(frame);
            };
            this.tickerRaf = requestAnimationFrame(frame);
            this.emit('change', this.snapshot());
        }

        stopTeleprompter(silent) {
            const s = this.state;
            clearTimeout(this.countTimer);
            cancelAnimationFrame(this.tickerRaf);
            s.countdown = 0;
            s.teleRunning = false;
            this.views.tele.classList.remove('is-running');
            this.renderHeader();
            if (!silent) this.emit('change', this.snapshot());
        }

        // ── IslandView state rules ─────────────────────────────────────
        compute() {
            const s = this.state;
            const bubble = s.mode === 'bubble';
            const n = s.notif;
            const media = s.playing;
            const active = s.expanded || !!n || media || this.isTeleLive;
            const physW = bubble ? 0 : PHYS_W;
            const calcText = (text, pad) => Math.max(Math.max(260, (textWidth(text) + pad) * 2 + physW), SMALL_W + 40);

            let w;
            if (s.expanded) w = Math.max(380, EXP_W);
            else if (n) {
                const t = this.t;
                switch (n.type) {
                    case 'airpods': w = calcText(t.pods, 80); break;
                    case 'charging': w = Math.max(calcText('82%', 64), SMALL_W + 80); break;
                    case 'silent': w = calcText(t.silent, 100); break;
                    case 'wifi': w = calcText(t.ssid, 90); break;
                    case 'welcome': w = Math.max(330, SMALL_W + 140); break;
                    case 'goal': w = Math.max(calcText(`🇪🇸 ${t.team}`, 75), calcText(n.score, 75)); break;
                    default: w = 300;
                }
            } else if (media) w = bubble ? MUSIC_W : MUSIC_W + 22;
            else w = SMALL_W;
            w = Math.min(Math.max(w, bubble ? SMALL_W : PHYS_W), 780);

            const contentTop = bubble ? 10 + 30 + 8 : NOTCH_H + 6;
            let h;
            if (!active && bubble) h = 0;
            else if (s.expanded) {
                const base = contentTop - 5;
                h = base + ({ tele: 175, sports: 170, events: 145 }[s.panel] || 85);
            } else if (n || media) {
                h = n && n.type === 'welcome' ? BASE_H + 55 : BASE_H + (bubble ? 8 : -1);
            } else h = BASE_H;
            h = Math.max(h, BASE_H);

            let r;
            if (!active && bubble) r = 0;
            else if (s.expanded) r = 25;
            else if (n || media) r = n && n.type === 'welcome' ? 35 : (bubble ? h / 2 : 12);
            else r = CORNER;

            const y = bubble ? (active ? 8 : -40) : 0;
            return { w, h, r, y, d: s.expanded ? 10 : 5, active, bubble };
        }

        update(instant = false) {
            const s = this.state;
            const now = performance.now();
            const c = this.compute();
            const notifActive = !!s.notif;
            const wAnim = instant ? null : (notifActive ? easeOut(0.18) : (c.w < 340 ? easeOut(0.25) : PANEL_SPRING));
            const hAnim = instant ? null : (notifActive ? easeOut(0.18) : (c.h < 100 ? easeOut(0.25) : PANEL_SPRING));
            this.p.w.to(c.w, wAnim, now);
            this.p.h.to(c.h, hAnim, now);
            this.p.r.to(c.r, hAnim, now);
            this.p.d.to(c.d, hAnim, now);
            this.p.y.to(c.y, instant ? null : OFFSET_SPRING, now);

            // Surface opacity: on at once, fades 0.4 s after a 0.3 s grace.
            clearTimeout(this.fadeTimer);
            if (c.active) {
                this.setBg(1, instant);
            } else {
                this.fadeTimer = setTimeout(() => this.setBg(0, false), instant ? 0 : 300);
            }

            this.root.dataset.mode = s.mode;
            this.root.dataset.glass = s.glass && !(s.disco && s.playing && !s.glass) ? 'on' : 'off';
            this.root.dataset.disco = s.disco && s.playing ? 'on' : 'off';
            this.root.dataset.expanded = s.expanded ? 'on' : 'off';

            const v = this.views;
            const show = (el, on) => el.classList.toggle('is-on', !!on);
            const ex = s.expanded;
            show(v.header, ex);
            show(v.media, ex && s.panel === 'media');
            show(v.events, ex && s.panel === 'events');
            show(v.tele, ex && s.panel === 'tele');
            show(v.sports, ex && s.panel === 'sports');
            show(v.sportsbg, ex && s.panel === 'sports');
            show(v.quick, ex && s.panel !== 'sports' && s.panel !== 'tele' && !(c.bubble && s.panel === 'media'));
            show(v.notif, !ex && notifActive);
            show(v.compact, !ex && !notifActive && s.playing);
            v.quick.style.top = `${c.h - 28}px`;
            v.compact.style.top = c.bubble ? '8px' : '0';
            v.notif.style.width = `${c.w}px`;
            v.notif.style.marginLeft = `${-c.w / 2}px`;
            v.notif.style.top = c.bubble ? '8px' : '0';
            if (s.notif && s.notif.type === 'welcome') v.notif.style.height = '88px';
            else v.notif.style.height = '';
            this.positionViews();
            this.slideChips();
            this.kick();
        }

        setBg(target, instant) {
            if (target === this.bgTarget) return;
            this.bgTarget = target;
            const el = [this.fill, this.glass];
            el.forEach((e) => {
                e.style.transition = instant || target === 1 ? 'none' : 'opacity .4s cubic-bezier(.42,0,.58,1)';
                e.style.opacity = String(target);
            });
            this.bgOpacity = target;
        }

        positionViews() {
            const v = this.views;
            const widths = { compact: null, media: EXP_W, events: EXP_W, tele: EXP_W, sports: EXP_W, sportsbg: EXP_W, header: EXP_W, quick: EXP_W };
            const c = this.compute();
            Object.entries(widths).forEach(([k, w]) => {
                const el = v[k];
                const width = w || (c.bubble ? MUSIC_W : MUSIC_W + 22);
                el.style.width = `${width}px`;
                el.style.marginLeft = `${-width / 2}px`;
            });
            const shift = c.bubble ? 8 : 0;
            v.sportsbg.style.top = `${shift}px`;
            v.sports.style.top = `${(c.bubble ? 48 : 38)}px`;
            v.tele.style.top = `${(c.bubble ? 48 : 38) + 8}px`;
            v.tele.style.paddingTop = '0';
            v.media.style.top = c.bubble ? '56px' : '38px';
            v.events.style.top = c.bubble ? '56px' : '38px';
            v.header.style.top = c.bubble ? '18px' : '0';
        }

        kick() {
            if (!this.raf) {
                this.last = performance.now();
                this.raf = requestAnimationFrame(this.loop);
            }
        }

        loop(now) {
            const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
            this.last = now;
            let busy = false;
            Object.values(this.p).forEach((p) => { busy = p.step(now, dt) || busy; });
            this.tick(now);
            if (busy || this.discoActive) {
                this.raf = requestAnimationFrame(this.loop);
            } else {
                this.raf = 0;
            }
        }

        tick() {
            const { w, h, r, d, y } = this.p;
            const bubble = this.state.mode === 'bubble';
            const W = w.v;
            const H = Math.max(0, h.v);
            const x0 = (CANVAS_W - W) / 2;
            const y0 = y.v;
            const path = notchPath(x0, y0, W, H, r.v, d.v, bubble);
            this.surface.style.clipPath = `path('${path}')`;
            this.surface.style.webkitClipPath = `path('${path}')`;
            const box = `left:${x0.toFixed(2)}px;top:${y0.toFixed(2)}px;width:${W.toFixed(2)}px;height:${H.toFixed(2)}px;`;
            this.fill.style.cssText = box + `opacity:${this.fill.style.opacity};transition:${this.fill.style.transition};background:${this.fillBackground(H)}`;
            this.glass.style.cssText = box + `opacity:${this.glass.style.opacity};transition:${this.glass.style.transition};display:${this.root.dataset.glass === 'on' ? 'block' : 'none'}`;
            if (this.root.dataset.disco === 'on') this.glow.style.cssText = box + this.glowVars(H);
            this.hit.style.cssText = `left:${(x0 - 4).toFixed(1)}px;top:0;width:${(W + 8).toFixed(1)}px;height:${Math.max(36, y0 + H + 4).toFixed(1)}px`;
            this.pulseEl.style.transform = this.p.pulse.v !== 1 ? `scale(${this.p.pulse.v.toFixed(4)})` : '';
        }

        fillBackground(H) {
            const s = this.state;
            const glassOn = this.root.dataset.glass === 'on';
            if (!glassOn) return '#000';
            const solid = Math.min(1, Math.max(0, NOTCH_H / Math.max(1, H)));
            if (s.expanded && s.panel === 'tele' && (s.teleRunning || s.countdown)) {
                return `linear-gradient(#000 0, #000 ${(solid * 100).toFixed(2)}%, rgb(0 0 0 / .5) ${(Math.min(1, solid + 0.3) * 100).toFixed(2)}%, rgb(0 0 0 / .5) 100%)`;
            }
            if (s.mode === 'bubble') {
                return `linear-gradient(rgb(0 0 0 / .62), rgb(0 0 0 / .5))`;
            }
            return `linear-gradient(#000 0, #000 ${(solid * 100).toFixed(2)}%, rgb(0 0 0 / .12) 100%)`;
        }

        glowVars(H) {
            const s = this.state;
            const expanded = s.expanded;
            const color = this.track.colors[0];
            const topFade = expanded ? Math.max(0, NOTCH_H - 4) : Math.max(0, NOTCH_H * 0.45);
            const a = Math.min(0.92, topFade / Math.max(1, H));
            const b = Math.min(1, a + (expanded ? 0.08 : 0.18));
            const center = expanded ? Math.min(0.62, Math.max(b + 0.08, (topFade + Math.min(34, Math.max(16, (H - topFade) * 0.35))) / Math.max(1, H))) : 0.75;
            const R = Math.max(this.p.w.v, H) * (expanded ? 0.44 : 0.56);
            return `--glow:${color};--glow-a:${(a * 100).toFixed(1)}%;--glow-b:${(b * 100).toFixed(1)}%;--glow-y:${(center * 100).toFixed(1)}%;--glow-r:${R.toFixed(0)}px`;
        }

        // ── Media clocks (12 fps waveform, 1 Hz progress, disco beats) ───
        startClocks() {
            if (this.waveTimer || !this.visible) return;
            this.waveTimer = setInterval(() => this.waveFrame(), 1000 / 12);
            this.secTimer = setInterval(() => {
                const s = this.state;
                if (!s.playing) return;
                s.elapsed += 1;
                if (s.elapsed >= this.track.duration) this.skip(1);
                else this.syncMedia();
            }, 1000);
            this.discoTimer = setInterval(() => this.discoBeat(), 150);
        }

        stopClocks() {
            clearInterval(this.waveTimer);
            clearInterval(this.secTimer);
            clearInterval(this.discoTimer);
            this.waveTimer = this.secTimer = this.discoTimer = 0;
        }

        applyWaveColors() {
            const c = this.track.colors;
            this.root.style.setProperty('--wave-grad', `linear-gradient(90deg, ${c.join(', ')})`);
            this.root.style.setProperty('--wave-shadow', `color-mix(in srgb, ${c[0]} 30%, transparent)`);
            this.waveGroups = Array.from(this.root.querySelectorAll('.vni-wave')).map((w) => ({ view: w.closest('.vni-view'), bars: Array.from(w.children) }));
        }

        waveFrame() {
            const s = this.state;
            if (!this.waveGroups) return;
            // Only the waveform on screen is animated.
            const bars = this.waveGroups.filter((g) => g.view && g.view.classList.contains('is-on')).flatMap((g) => g.bars);
            if (!bars.length) return;
            if (!s.playing) {
                bars.forEach((b) => { b.style.height = '3px'; });
                return;
            }
            const t = Date.now() / 1000;
            const hash = hashString(this.track.title);
            const bpm = 80 + (hash % 70);
            const seed = (hash % 100) / 100;
            const beatF = (bpm / 60) * Math.PI;
            const beat = Math.abs(Math.sin(t * beatF)) ** 3 * 6;
            const heights = [];
            for (let i = 0; i < 7; i++) {
                const n = (i - 3) / 3;
                const organic = Math.sin(t * 2.2 + i * 0.4) * 2.5;
                const energy = Math.cos(t * 7.5 - i * 0.9 + seed * 5) * 2;
                const detail = Math.sin(t * 18 + seed * 50) * 1;
                const total = 5 + organic + energy + detail + (1 - n * n) * beat;
                heights.push(Math.min(14, Math.max(3, total)).toFixed(1));
            }
            bars.forEach((b, i) => { b.style.height = `${heights[i % 7]}px`; });
        }

        discoBeat() {
            const s = this.state;
            const on = s.disco && s.playing;
            this.discoActive = on;
            if (!on) {
                if (this.p.pulse.target !== 1 || this.p.pulse.v !== 1) {
                    this.p.pulse.to(1, spring(0.4, 0.8), performance.now());
                    this.kick();
                }
                return;
            }
            const t = Date.now() / 1000;
            const progress = s.elapsed / this.track.duration;
            const energy = Math.min(1, 0.4 + progress * 2);
            const hash = hashString(this.track.title);
            const bpm = energy > 0.6 ? 64 + (hash % 60) : 50 + (hash % 30);
            const interval = 60 / bpm;
            const inBeat = (t + (Math.random() * 0.1 - 0.05)) % interval;
            const skip = Math.random() < Math.max(0.1, 0.4 - progress);
            if (inBeat < 0.12 && Math.abs(this.p.pulse.target - 1) < 1e-3 && !skip) {
                const max = 1.03 + 0.04 * energy;
                const intensity = 1.02 + Math.random() * (max - 1.02);
                const now = performance.now();
                this.p.pulse.to(intensity, energy > 0.5 ? spring(0.4, 0.55) : spring(0.6, 1), now);
                setTimeout(() => this.p.pulse.to(1, spring(0.6, 0.9), performance.now()), 200);
            }
            this.kick();
        }

        syncMedia() {
            const s = this.state;
            const p = Math.min(1, s.elapsed / this.track.duration);
            const track = this.views.media.querySelector('.vni-track');
            if (track) track.style.setProperty('--p', p.toFixed(4));
            const time = this.views.media.querySelector('.vni-time');
            if (time) time.textContent = `-${fmt(this.track.duration - s.elapsed)}`;
        }

        destroy() {
            this.stopClocks();
            cancelAnimationFrame(this.raf);
            document.removeEventListener('pointerdown', this.outside);
            if (this.ro) this.ro.disconnect();
            if (this.io) this.io.disconnect();
            this.root.remove();
        }
    }

    VibeIsland.notchPath = notchPath;
    window.VibeIsland = VibeIsland;
})();
