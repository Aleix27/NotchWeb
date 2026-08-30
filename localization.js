(() => {
    'use strict';

    const supportedLanguages = ['es', 'en', 'zh'];
    const storageKey = 'vibenotch-language';

    const copy = {
        es: {
            'Your notch.': 'Tu notch.',
            'Your vibe.': 'Tu estilo.',
            'Super clean and aesthetic, wow! Great work developer.': 'Súper limpia y estética. ¡Un trabajo increíble!'
        },
        en: {
            'Visión': 'Vision',
            'Tienda': 'Store',
            'Diseño': 'Design',
            'Potencia': 'Performance',
            'Soporte': 'Support',
            'Privacidad': 'Privacy',
            'Descargar': 'Download',
            'Anuncio de VibeNotch': 'VibeNotch demo',
            'MacBook mostrando VibeNotch en acción': 'MacBook showing VibeNotch in action',
            'VibeNotch funcionando en macOS': 'VibeNotch running on macOS',
            'Comportamiento fluido del notch': 'Fluid notch behavior',
            'Estilos adaptativos del notch': 'Adaptive notch styles',
            'Ver el tráiler de VibeNotch Sports en YouTube': 'Watch the VibeNotch Sports trailer on YouTube',
            'Modo pildora reproduciendo musica': 'Floating pill playing music',
            'Redes sociales de VibeNotch': 'VibeNotch social profiles',
            'Tu email...': 'Your email...',
            'Tu correo electrónico': 'Your email address',
            'Calendario en VibeNotch': 'Calendar in VibeNotch',
            'Portadas reales en VibeNotch': 'Real artwork in VibeNotch',
            'Teleprompter en VibeNotch': 'Teleprompter in VibeNotch',
            'VibeNotch en varios MacBook: saludos inteligentes, control de música y recordatorios': 'VibeNotch on several MacBooks: smart greetings, music controls and reminders',
            'Notch Música': 'Music notch',
            'Notch Calendario': 'Calendar notch',
            'Notch Asistente': 'Assistant notch',
            'La utilidad de notch más óptima y leal del mercado, programada nativa en Swift.': 'A fast, faithful notch utility built natively in Swift.',
            'Descargar VibeNotch': 'Download VibeNotch',
            'Ya disponible en la Mac App Store': 'Available now on the Mac App Store',
            'Desplázate para reproducir': 'Scroll to play',
            'Grabación real de VibeNotch en macOS': 'Real VibeNotch footage on macOS',
            'Demostración de la aplicación en acción. VibeNotch se integra perfectamente con tu sistema.': 'A real demonstration of VibeNotch in action, seamlessly integrated with macOS.',
            'SIMULACIÓN': 'SIMULATION',
            'Siente la experiencia VibeNotch': 'Feel the VibeNotch experience',
            'Mira de cerca la fluidez y adaptabilidad de cada interacción en tiempo real.': 'See the fluidity and adaptability of every interaction in real time.',
            'Física Real': 'Real Physics',
            'Comportamiento fluido.': 'Fluid by nature.',
            'Siente la respuesta física de cada interacción. El notch se expande, se contrae y se adapta con transiciones ultra suaves a tus gestos y clics cotidianos.': 'Feel every interaction respond naturally. The notch expands, contracts and adapts with exceptionally smooth transitions to your everyday gestures and clicks.',
            'Estilo Adaptativo': 'Adaptive Style',
            'Múltiples caras.': 'Many faces.',
            'Personaliza la interfaz a tu gusto. Cambia la cara y la información mostrada según tu actividad: música, eventos de calendario o estado de batería.': 'Make the interface yours. Change its look and the information it shows for music, calendar events or battery status.',
            'NOVEDADES': 'WHAT’S NEW',
            'Más que música: ahora tu notch también organiza el día.': 'More than music. Your notch now organizes your day.',
            'La nueva experiencia reúne controles, eventos, utilidades y estados rápidos sin abrir ventanas extra.': 'The new experience brings controls, events, utilities and quick status updates together without opening extra windows.',
            'Calendario': 'Calendar',
            'Eventos y reuniones al instante.': 'Events and meetings at a glance.',
            'Consulta lo próximo de tu agenda directamente desde el notch. Con un simple toque, abre los detalles de tus reuniones y eventos planificados sin interrumpir tu flujo de trabajo.': 'See what is next on your calendar directly from the notch. Open meeting and event details with one tap, without interrupting your workflow.',
            'Portadas reales y controles vivos.': 'Real artwork and responsive controls.',
            'La reproducción se siente más nativa: portada, progreso, controles y accesos de estado en una interfaz compacta.': 'Playback feels more native, with artwork, progress, controls and status shortcuts in one compact interface.',
            'Un notch más integrado.': 'A more integrated notch.',
            'El panel gana profundidad visual, bordes suaves y animaciones más limpias para sentirse como una pieza del sistema.': 'The panel gains visual depth, softer edges and cleaner animations so it feels like part of the system.',
            'Actualizable y Seguro': 'Updatable and Secure',
            'Disponible y actualizable.': 'Available and easy to update.',
            'Instalación directa desde la Mac App Store, actualizaciones simples y una ficha pensada para que VibeNotch sea fácil de encontrar.': 'Install directly from the Mac App Store, receive simple updates and find VibeNotch whenever you need it.',
            'NOVEDAD · VERSIÓN 2.0': 'NEW · VERSION 2.0',
            'El deporte en directo, dentro del notch. Marcador en vivo con la muesca cerrada y un panel LIVE con césped 3D, goleadores, tarjetas, prórroga y penaltis. Debutó con el Mundial 2026 y ahora crece a todo el catálogo.': 'Live sport, inside the notch. Follow the score while it is closed, then open a LIVE panel with a 3D pitch, scorers, cards, extra time and penalties. It debuted with the 2026 World Cup and is expanding across the catalog.',
            'Ver el tráiler': 'Watch the trailer',
            'Catálogo Sports': 'Sports catalog',
            'Fútbol': 'Football',
            'Baloncesto': 'Basketball',
            'Fútbol americano': 'American football',
            'Hockey': 'Hockey',
            'Béisbol': 'Baseball',
            'Tenis': 'Tennis',
            'Motor': 'Motorsport',
            'Deportes de combate': 'Combat sports',
            'Teleprompter integrado': 'Built-in teleprompter',
            'Lee tus apuntes o guiones desde el notch sin desviar la mirada de la cámara.': 'Read notes or scripts from the notch without looking away from the camera.',
            'NUESTRA VISIÓN': 'OUR VISION',
            'Como si viniera de fábrica.': 'As if it came with your Mac.',
            'Creemos que las mejores herramientas son las que desaparecen. Diseñamos VibeNotch para que se sienta como una extensión natural de macOS.': 'We believe the best tools are the ones that disappear. VibeNotch is designed to feel like a natural extension of macOS.',
            'Simple': 'Simple',
            'Sin funciones innecesarias.': 'No unnecessary features.',
            'Económica': 'Fair',
            'Un único pago para siempre.': 'One payment, forever.',
            'Privada': 'Private',
            'Cero recopilación de datos.': 'Zero data collection.',
            'Invisible': 'Invisible',
            'Consumo de recursos inexistente.': 'Virtually no resource use.',
            'DISEÑO Y UTILIDAD': 'DESIGN AND UTILITY',
            'El notch es mucho más.': 'The notch can do much more.',
            'Una transición automática e inteligente. Observa cómo cambia la muesca de tu pantalla según las herramientas que utilices.': 'An automatic, intelligent transition. Watch the notch adapt to the tools you use.',
            'OBTENER': 'GET',
            'EDAD': 'AGE',
            'Nativo en Swift.': 'Native in Swift.',
            'La muesca más inteligente.': 'The smarter notch.',
            '50 RESEÑAS': '50 REVIEWS',
            'UTILIDADES': 'UTILITIES',
            'FILOSOFÍA': 'PHILOSOPHY',
            'Programado desde cero en Swift para macOS, aprovechando cada gramo de potencia de Apple Silicon sin compromisos.': 'Built from scratch in Swift for macOS, using the full power of Apple Silicon without compromise.',
            'RENDIMIENTO': 'PERFORMANCE',
            'Creado por usuarios.': 'Built by Mac users.',
            'Un notch programado de un usuario de Mac para usuarios de Mac, donde la fluidez, utilidad, fidelidad y rendimiento son la única prioridad.': 'A notch utility built by a Mac user for Mac users, where fluidity, usefulness, fidelity and performance come first.',
            'COMPATIBILIDAD': 'COMPATIBILITY',
            'Funciona en tu Mac.': 'Works on your Mac.',
            'Compatible con todos los MacBooks con notch y los modelos anteriores gracias al modo píldora flotante.': 'Compatible with every MacBook with a notch and earlier models through floating pill mode.',
            'REPRODUCIENDO': 'NOW PLAYING',
            'Modo Píldora para Macs sin notch': 'Floating pill mode for Macs without a notch',
            'Uso mínimo de memoria.': 'Minimal memory use.',
            'Consumo cero en reposo.': 'Zero CPU use while idle.',
            'BATERÍA': 'BATTERY',
            'Consumo de batería inexistente.': 'Negligible battery use.',
            'RESEÑAS': 'REVIEWS',
            'Lo que opinan': 'What our',
            'nuestros usuarios': 'users say',
            '50 reseñas publicadas en la App Store': '50 reviews published on the App Store',
            '"Es un antes y un después esta aplicación. He pasado de tener una pestaña que no sirve para nada a darle utilidad real."': '“This app changes everything. It turned a useless notch into something genuinely useful.”',
            '"Parece una app nativa de lo bien implementada que está. Una vez la usas, ya no hay vuelta atrás."': '“It feels native because it is implemented so well. Once you use it, there is no going back.”',
            '"Es la mejor app para el notch, le da vida. No sé por qué Apple nunca lo hizo antes."': '“The best app for the notch. It brings it to life. I do not know why Apple never did this.”',
            '"La interfaz es limpia e intuitiva y no afecta en nada al rendimiento. Hace justo lo que promete."': '“The interface is clean and intuitive, with no impact on performance. It does exactly what it promises.”',
            '"Simplemente perfecto, algo que debería estar implementado nativamente en Apple."': '“Simply perfect. This should be built into macOS.”',
            '"Una de las mejores apps notch que existen: súper sencilla pero demasiado funcional."': '“One of the best notch apps available: very simple and incredibly useful.”',
            '"Fluida, amigable y súper limpia."': '“Fluid, friendly and beautifully clean.”',
            '"Super clean and aesthetic, wow! Great work developer."': '“Super clean and aesthetic. Amazing work!”',
            'EN CORTO': 'AT A GLANCE',
            'Todo lo que necesitas saber.': 'Everything you need to know.',
            'Precio': 'Price',
            '4,99 € · pago único': '€4.99 · one-time purchase',
            'Versión': 'Version',
            'Requisitos': 'Requirements',
            'macOS 14 o posterior': 'macOS 14 or later',
            'Tamaño': 'Size',
            'Chip': 'Chip',
            'Apple Silicon e Intel': 'Apple Silicon and Intel',
            'Sin recopilación de datos': 'No data collection',
            '¿Funciona si mi Mac no tiene notch?': 'Does it work if my Mac has no notch?',
            'Sí. El modo píldora flotante coloca la misma interfaz en la parte superior de la pantalla, así que funciona igual en cualquier Mac con macOS 14 o posterior.': 'Yes. Floating pill mode places the same interface at the top of the screen, so it works on any Mac running macOS 14 or later.',
            '¿Es una suscripción?': 'Is it a subscription?',
            'No. Es un pago único de 4,99 € en la Mac App Store. Las actualizaciones están incluidas.': 'No. It is a one-time €4.99 purchase on the Mac App Store, with updates included.',
            '¿Consume batería o recursos?': 'Does it use battery or resources?',
            'Está programada de forma nativa en Swift y en reposo el consumo es prácticamente nulo: menos de 35 MB de memoria y 0 % de CPU cuando no interactúas con ella.': 'It is built natively in Swift and uses virtually no resources while idle: under 35 MB of memory and 0% CPU when you are not interacting with it.',
            '¿Qué datos recoge la aplicación?': 'What data does the app collect?',
            'Ninguno. No hay analítica, ni servidores externos, ni cuentas. Todo ocurre en tu Mac.': 'None. There are no analytics, external servers or accounts. Everything happens on your Mac.',
            '¿Con qué apps de música funciona?': 'Which music apps does it support?',
            'Con las que se integran con los controles de reproducción de macOS, como Música de Apple y Spotify. Verás portada, título, artista y progreso directamente en el notch.': 'Any app that integrates with macOS media controls, including Apple Music and Spotify. Artwork, title, artist and progress appear directly in the notch.',
            'El futuro ya está aquí.': 'The future is already here.',
            'Descarga VibeNotch y lleva tu Mac al siguiente nivel.': 'Download VibeNotch and take your Mac to the next level.',
            'Consigue la versión 2.0 en la Mac App Store': 'Get version 2.0 on the Mac App Store',
            'Novedades y Trucos': 'News and Tips',
            'Únete a la lista para recibir actualizaciones exclusivas sobre VibeNotch.': 'Join the list for exclusive VibeNotch updates.',
            'Suscribirse': 'Subscribe',
            '¡Gracias por suscribirte!': 'Thanks for subscribing!',
            'Más Apps': 'More Apps',
            'Nueva App': 'New App',
            '© 2026 VibeNotch. Minimalismo hecho en Tarragona.': '© 2026 VibeNotch. Minimalism made in Tarragona.',
            'Soporte VibeNotch': 'VibeNotch Support',
            'Estamos aquí para ayudarte a sacar el máximo provecho de tu notch.': 'We are here to help you get the most from your notch.',
            '¿Es compatible con mi Mac?': 'Is it compatible with my Mac?',
            'VibeNotch es compatible con todos los MacBook Air y MacBook Pro que tienen notch físico. También funciona en Macs sin notch mediante el modo "Píldora flotante". Requiere macOS 14.0 o superior.': 'VibeNotch supports every MacBook Air and MacBook Pro with a physical notch. It also works on Macs without one through floating pill mode. macOS 14.0 or later is required.',
            '¿Afecta a la batería?': 'Does it affect battery life?',
            'No. VibeNotch está optimizado al máximo en Swift nativo. El consumo de CPU es prácticamente 0% en reposo y no notarás ninguna diferencia en la autonomía de tu Mac.': 'No. VibeNotch is highly optimized in native Swift. CPU use is virtually 0% while idle, with no noticeable effect on your Mac’s battery life.',
            '¿Qué apps de música soporta?': 'Which music apps are supported?',
            'Soporta Apple Music, Spotify y cualquier aplicación que use los controles de reproducción nativos de macOS (como YouTube en Safari o Chrome).': 'It supports Apple Music, Spotify and any app that uses native macOS media controls, including YouTube in Safari or Chrome.',
            '¿Cómo activo el Launchpad?': 'How do I open the controls?',
            'Solo tienes que pasar el cursor sobre el notch y hacer click. Puedes configurar las herramientas rápidas desde los ajustes de la aplicación (icono de engranaje en el notch expandido).': 'Hover over the notch and click. You can configure quick tools from the app settings using the gear icon in the expanded notch.',
            '¿Es de pago único?': 'Is it a one-time purchase?',
            'Sí. Odiamos las suscripciones tanto como tú. Un único pago y tendrás acceso a todas las funciones y actualizaciones futuras para siempre.': 'Yes. One purchase gives you permanent access to all included features and future updates.',
            '¿Es seguro?': 'Is it safe?',
            'Totalmente. VibeNotch no recopila datos. No necesita conexión a internet para funcionar (excepto para descargar carátulas si así lo deseas) y no tiene acceso a tus archivos privados.': 'Absolutely. VibeNotch does not collect data. It works without an internet connection, except when downloading artwork if you choose, and it cannot access your private files.',
            '¿Aún tienes dudas?': 'Still have questions?',
            'Si no has encontrado la respuesta que buscabas, escríbenos directamente.': 'If you did not find the answer you need, contact us directly.',
            '@aleixxet en Instagram': '@aleixxet on Instagram',
            'Política de Privacidad': 'Privacy Policy',
            'Actualizado el 11 de enero de 2026': 'Updated January 11, 2026',
            'Tu privacidad es lo primero': 'Your privacy comes first',
            'VibeNotch no recopila, almacena ni transmite ningún dato personal. Toda la información permanece en tu dispositivo.': 'VibeNotch does not collect, store or transmit personal data. All information stays on your device.',
            'Resumen': 'Summary',
            'VibeNotch está diseñado con un principio simple: tu Mac es tuyo. No recopilamos datos, no hay análisis de uso, no hay servidores externos. La aplicación funciona completamente offline.': 'VibeNotch follows one simple principle: your Mac is yours. We collect no data, use no analytics and operate no external servers. The app works entirely offline.',
            'Información que accedemos': 'Information the app accesses',
            'Para ofrecer sus funciones, VibeNotch accede a cierta información del sistema. Esta información nunca sale de tu dispositivo.': 'To provide its features, VibeNotch accesses certain system information. It never leaves your device.',
            'Reproducción musical': 'Media playback',
            'Qué': 'What',
            'Título, artista, álbum y carátula': 'Title, artist, album and artwork',
            'Para qué': 'Purpose',
            'Mostrar "Reproduciendo ahora"': 'Display Now Playing',
            'Almacenado': 'Stored',
            'Solo en memoria RAM': 'In memory only',
            'Transmitido': 'Transmitted',
            'Nunca': 'Never',
            'Estado del sistema': 'System status',
            'Batería, Wi-Fi, Bluetooth, silencio': 'Battery, Wi-Fi, Bluetooth and mute status',
            'Notificaciones del notch': 'Notch notifications',
            'Preferencias': 'Preferences',
            'Tus ajustes de la aplicación': 'Your app settings',
            'Recordar tu configuración': 'Remember your configuration',
            'Localmente en tu Mac': 'Locally on your Mac',
            'Lo que NO recopilamos': 'What we DO NOT collect',
            'Información personal identificable': 'Personally identifiable information',
            'Datos de ubicación': 'Location data',
            'Análisis de uso o estadísticas': 'Usage analytics or statistics',
            'Informes de errores automáticos': 'Automatic crash reports',
            'Identificadores de publicidad': 'Advertising identifiers',
            'Datos de navegación o historial': 'Browsing data or history',
            'Conexión a internet': 'Internet connection',
            'VibeNotch puede conectarse a internet únicamente para obtener carátulas de álbum cuando no están disponibles localmente, usando la API pública de iTunes. No se transmite información personal en esta solicitud.': 'VibeNotch may connect to the internet only to retrieve album artwork when it is unavailable locally, using the public iTunes API. No personal information is sent with this request.',
            'No hay telemetría. No hay analytics. No hay servidores propios.': 'No telemetry. No analytics. No proprietary servers.',
            'Integraciones': 'Integrations',
            'VibeNotch se integra con Apple Music y Spotify para mostrar información de reproducción. Estas integraciones funcionan completamente en tu dispositivo a través de las APIs del sistema.': 'VibeNotch integrates with Apple Music and Spotify to display playback information. These integrations run entirely on your device through system APIs.',
            'Resumen de datos': 'Data summary',
            'Dato': 'Data',
            'Recopilado': 'Collected',
            'Compartido': 'Shared',
            'Info musical': 'Media information',
            'No': 'No',
            'Sistema': 'System',
            'Local': 'Local',
            'Contacto': 'Contact',
            'Si tienes preguntas sobre esta política de privacidad:': 'If you have questions about this privacy policy:',
            'Diseñado con privacidad en mente': 'Designed with privacy in mind',
            'Tus datos nunca salen de tu Mac.': 'Your data never leaves your Mac.'
        },
        zh: {
            'Visión': '理念',
            'Tienda': '商店',
            'Diseño': '设计',
            'Potencia': '性能',
            'Soporte': '支持',
            'Privacidad': '隐私',
            'Descargar': '下载',
            'Anuncio de VibeNotch': 'VibeNotch 演示',
            'MacBook mostrando VibeNotch en acción': 'MacBook 上运行的 VibeNotch',
            'VibeNotch funcionando en macOS': 'VibeNotch 在 macOS 上运行',
            'Comportamiento fluido del notch': '流畅的刘海交互',
            'Estilos adaptativos del notch': '自适应刘海风格',
            'Ver el tráiler de VibeNotch Sports en YouTube': '在 YouTube 观看 VibeNotch Sports 预告片',
            'Modo pildora reproduciendo musica': '正在播放音乐的悬浮胶囊',
            'Redes sociales de VibeNotch': 'VibeNotch 社交平台',
            'Tu email...': '你的邮箱…',
            'Tu correo electrónico': '你的电子邮箱',
            'Calendario en VibeNotch': 'VibeNotch 日历',
            'Portadas reales en VibeNotch': 'VibeNotch 中的真实封面',
            'Teleprompter en VibeNotch': 'VibeNotch 提词器',
            'VibeNotch en varios MacBook: saludos inteligentes, control de música y recordatorios': '多台 MacBook 上的 VibeNotch：智能问候、音乐控制和提醒',
            'Notch Música': '音乐刘海',
            'Notch Calendario': '日历刘海',
            'Notch Asistente': '助手刘海',
            'La utilidad de notch más óptima y leal del mercado, programada nativa en Swift.': '原生 Swift 打造，快速、可靠的刘海屏工具。',
            'Descargar VibeNotch': '下载 VibeNotch',
            'Ya disponible en la Mac App Store': '现已登陆 Mac App Store',
            'Desplázate para reproducir': '滚动即可播放',
            'Grabación real de VibeNotch en macOS': 'VibeNotch 在 macOS 上的真实演示',
            'Demostración de la aplicación en acción. VibeNotch se integra perfectamente con tu sistema.': 'VibeNotch 真实运行演示，与 macOS 无缝融合。',
            'SIMULACIÓN': '交互演示',
            'Siente la experiencia VibeNotch': '感受 VibeNotch 体验',
            'Mira de cerca la fluidez y adaptabilidad de cada interacción en tiempo real.': '近距离感受每次实时交互的流畅与灵活。',
            'Física Real': '真实动效',
            'Comportamiento fluido.': '自然流畅。',
            'Siente la respuesta física de cada interacción. El notch se expande, se contrae y se adapta con transiciones ultra suaves a tus gestos y clics cotidianos.': '每次交互都拥有自然反馈。刘海会随着日常手势和点击，以顺滑动画展开、收起并自动适应。',
            'Estilo Adaptativo': '自适应风格',
            'Múltiples caras.': '多种面貌。',
            'Personaliza la interfaz a tu gusto. Cambia la cara y la información mostrada según tu actividad: música, eventos de calendario o estado de batería.': '按你的喜好定制界面，并根据音乐、日历事件或电池状态显示不同外观和信息。',
            'NOVEDADES': '最新功能',
            'Más que música: ahora tu notch también organiza el día.': '不止音乐，刘海也能帮你安排一天。',
            'La nueva experiencia reúne controles, eventos, utilidades y estados rápidos sin abrir ventanas extra.': '无需打开额外窗口，即可集中查看控制、事件、工具和快捷状态。',
            'Calendario': '日历',
            'Eventos y reuniones al instante.': '日程与会议一目了然。',
            'Consulta lo próximo de tu agenda directamente desde el notch. Con un simple toque, abre los detalles de tus reuniones y eventos planificados sin interrumpir tu flujo de trabajo.': '直接在刘海中查看下一项日程。轻点即可打开会议和活动详情，不打断当前工作。',
            'Portadas reales y controles vivos.': '真实封面，灵动控制。',
            'La reproducción se siente más nativa: portada, progreso, controles y accesos de estado en una interfaz compacta.': '封面、进度、控制与状态快捷入口融入紧凑界面，让播放体验更原生。',
            'Un notch más integrado.': '更融入系统的刘海。',
            'El panel gana profundidad visual, bordes suaves y animaciones más limpias para sentirse como una pieza del sistema.': '更有层次的视觉、柔和边缘与干净动画，让面板像系统原生组件。',
            'Actualizable y Seguro': '安全更新',
            'Disponible y actualizable.': '随时下载，轻松更新。',
            'Instalación directa desde la Mac App Store, actualizaciones simples y una ficha pensada para que VibeNotch sea fácil de encontrar.': '直接从 Mac App Store 安装并轻松更新，随时都能找到 VibeNotch。',
            'NOVEDAD · VERSIÓN 2.0': '全新 · 2.0 版本',
            'El deporte en directo, dentro del notch. Marcador en vivo con la muesca cerrada y un panel LIVE con césped 3D, goleadores, tarjetas, prórroga y penaltis. Debutó con el Mundial 2026 y ahora crece a todo el catálogo.': '把实时体育带进刘海。收起时查看比分，展开 LIVE 面板即可看到 3D 球场、进球者、红黄牌、加时与点球。它从 2026 世界杯起步，并将覆盖更多赛事。',
            'Ver el tráiler': '观看预告片',
            'Catálogo Sports': '体育目录',
            'Fútbol': '足球',
            'Baloncesto': '篮球',
            'Fútbol americano': '美式橄榄球',
            'Hockey': '冰球',
            'Béisbol': '棒球',
            'Tenis': '网球',
            'Motor': '赛车',
            'Deportes de combate': '格斗运动',
            'Teleprompter integrado': '内置提词器',
            'Lee tus apuntes o guiones desde el notch sin desviar la mirada de la cámara.': '直接从刘海阅读笔记或台词，无需移开看向摄像头的视线。',
            'NUESTRA VISIÓN': '我们的理念',
            'Como si viniera de fábrica.': '仿佛 Mac 原生自带。',
            'Creemos que las mejores herramientas son las que desaparecen. Diseñamos VibeNotch para que se sienta como una extensión natural de macOS.': '最好的工具应该隐于无形。VibeNotch 被设计成 macOS 的自然延伸。',
            'Simple': '简洁',
            'Sin funciones innecesarias.': '没有多余功能。',
            'Económica': '实惠',
            'Un único pago para siempre.': '一次购买，永久使用。',
            'Privada': '私密',
            'Cero recopilación de datos.': '不收集任何数据。',
            'Invisible': '无感',
            'Consumo de recursos inexistente.': '几乎不占用系统资源。',
            'DISEÑO Y UTILIDAD': '设计与实用性',
            'El notch es mucho más.': '刘海还能做得更多。',
            'Una transición automática e inteligente. Observa cómo cambia la muesca de tu pantalla según las herramientas que utilices.': '自动且智能地切换。刘海会根据你正在使用的工具改变形态。',
            'OBTENER': '获取',
            'EDAD': '年龄',
            'Nativo en Swift.': 'Swift 原生开发。',
            'La muesca más inteligente.': '更智能的刘海。',
            '50 RESEÑAS': '50 条评价',
            'UTILIDADES': '工具类',
            'FILOSOFÍA': '理念',
            'Programado desde cero en Swift para macOS, aprovechando cada gramo de potencia de Apple Silicon sin compromisos.': '从零开始使用 Swift 为 macOS 打造，充分发挥 Apple 芯片性能。',
            'RENDIMIENTO': '性能',
            'Creado por usuarios.': '由 Mac 用户打造。',
            'Un notch programado de un usuario de Mac para usuarios de Mac, donde la fluidez, utilidad, fidelidad y rendimiento son la única prioridad.': '由 Mac 用户为 Mac 用户打造，把流畅、实用、真实与性能放在首位。',
            'COMPATIBILIDAD': '兼容性',
            'Funciona en tu Mac.': '适用于你的 Mac。',
            'Compatible con todos los MacBooks con notch y los modelos anteriores gracias al modo píldora flotante.': '支持所有带刘海的 MacBook，旧款机型也可使用悬浮胶囊模式。',
            'REPRODUCIENDO': '正在播放',
            'Modo Píldora para Macs sin notch': '无刘海 Mac 的悬浮胶囊模式',
            'Your notch.': '你的刘海。',
            'Your vibe.': '你的风格。',
            'Uso mínimo de memoria.': '极低内存占用。',
            'Consumo cero en reposo.': '闲置时 CPU 占用为零。',
            'BATERÍA': '电池',
            'Consumo de batería inexistente.': '几乎不消耗电量。',
            'RESEÑAS': '用户评价',
            'Lo que opinan': '听听',
            'nuestros usuarios': '用户怎么说',
            '50 reseñas publicadas en la App Store': 'App Store 已发布 50 条评价',
            '"Es un antes y un después esta aplicación. He pasado de tener una pestaña que no sirve para nada a darle utilidad real."': '“这款应用带来了彻底改变，让原本无用的刘海真正有了价值。”',
            '"Parece una app nativa de lo bien implementada que está. Una vez la usas, ya no hay vuelta atrás."': '“实现得太好了，就像原生应用一样。一旦用过，就再也离不开。”',
            '"Es la mejor app para el notch, le da vida. No sé por qué Apple nunca lo hizo antes."': '“这是最好的刘海应用，让它真正活了起来。不知道 Apple 为什么没有早点做。”',
            '"La interfaz es limpia e intuitiva y no afecta en nada al rendimiento. Hace justo lo que promete."': '“界面简洁直观，对性能没有影响，完全兑现了承诺。”',
            '"Simplemente perfecto, algo que debería estar implementado nativamente en Apple."': '“非常完美，这本应是 Apple 的原生功能。”',
            '"Super clean and aesthetic, wow! Great work developer."': '“非常简洁又美观！开发者做得太棒了。”',
            '"Una de las mejores apps notch que existen: súper sencilla pero demasiado funcional."': '“最好的刘海应用之一：非常简单，却极其实用。”',
            '"Fluida, amigable y súper limpia."': '“流畅、易用又干净。”',
            'EN CORTO': '快速了解',
            'Todo lo que necesitas saber.': '你需要了解的一切。',
            'Precio': '价格',
            '4,99 € · pago único': '€4.99 · 一次购买',
            'Versión': '版本',
            'Requisitos': '系统要求',
            'macOS 14 o posterior': 'macOS 14 或更高版本',
            'Tamaño': '大小',
            'Chip': '芯片',
            'Apple Silicon e Intel': 'Apple 芯片与 Intel',
            'Sin recopilación de datos': '不收集数据',
            '¿Funciona si mi Mac no tiene notch?': '没有刘海的 Mac 也能使用吗？',
            'Sí. El modo píldora flotante coloca la misma interfaz en la parte superior de la pantalla, así que funciona igual en cualquier Mac con macOS 14 o posterior.': '可以。悬浮胶囊模式会把同样的界面放在屏幕顶部，因此任何运行 macOS 14 或更高版本的 Mac 都能使用。',
            '¿Es una suscripción?': '这是订阅制吗？',
            'No. Es un pago único de 4,99 € en la Mac App Store. Las actualizaciones están incluidas.': '不是。在 Mac App Store 一次支付 €4.99，后续更新包含在内。',
            '¿Consume batería o recursos?': '会消耗电池或系统资源吗？',
            'Está programada de forma nativa en Swift y en reposo el consumo es prácticamente nulo: menos de 35 MB de memoria y 0 % de CPU cuando no interactúas con ella.': '应用使用 Swift 原生开发，闲置时几乎不占用资源：内存低于 35 MB，未交互时 CPU 占用为 0%。',
            '¿Qué datos recoge la aplicación?': '应用会收集哪些数据？',
            'Ninguno. No hay analítica, ni servidores externos, ni cuentas. Todo ocurre en tu Mac.': '不收集任何数据。没有分析工具、外部服务器或账户，一切都在你的 Mac 上完成。',
            '¿Con qué apps de música funciona?': '支持哪些音乐应用？',
            'Con las que se integran con los controles de reproducción de macOS, como Música de Apple y Spotify. Verás portada, título, artista y progreso directamente en el notch.': '支持接入 macOS 媒体控制的应用，例如 Apple Music 和 Spotify。封面、标题、艺人和进度会直接显示在刘海中。',
            'El futuro ya está aquí.': '未来已来。',
            'Descarga VibeNotch y lleva tu Mac al siguiente nivel.': '下载 VibeNotch，让你的 Mac 更进一步。',
            'Consigue la versión 2.0 en la Mac App Store': '前往 Mac App Store 获取 2.0 版本',
            'Novedades y Trucos': '资讯与技巧',
            'Únete a la lista para recibir actualizaciones exclusivas sobre VibeNotch.': '订阅邮件，获取 VibeNotch 独家更新。',
            'Suscribirse': '订阅',
            '¡Gracias por suscribirte!': '感谢订阅！',
            'Más Apps': '更多应用',
            'Nueva App': '新应用',
            '© 2026 VibeNotch. Minimalismo hecho en Tarragona.': '© 2026 VibeNotch。简约设计，源自塔拉戈纳。',
            'Soporte VibeNotch': 'VibeNotch 支持',
            'Estamos aquí para ayudarte a sacar el máximo provecho de tu notch.': '我们帮助你充分发挥刘海的价值。',
            '¿Es compatible con mi Mac?': '我的 Mac 兼容吗？',
            'VibeNotch es compatible con todos los MacBook Air y MacBook Pro que tienen notch físico. También funciona en Macs sin notch mediante el modo "Píldora flotante". Requiere macOS 14.0 o superior.': 'VibeNotch 支持所有带实体刘海的 MacBook Air 和 MacBook Pro。无刘海的 Mac 也可使用悬浮胶囊模式，需要 macOS 14.0 或更高版本。',
            '¿Afecta a la batería?': '会影响续航吗？',
            'No. VibeNotch está optimizado al máximo en Swift nativo. El consumo de CPU es prácticamente 0% en reposo y no notarás ninguna diferencia en la autonomía de tu Mac.': '不会。VibeNotch 使用原生 Swift 深度优化，闲置时 CPU 占用几乎为 0%，不会明显影响 Mac 续航。',
            '¿Qué apps de música soporta?': '支持哪些音乐应用？',
            'Soporta Apple Music, Spotify y cualquier aplicación que use los controles de reproducción nativos de macOS (como YouTube en Safari o Chrome).': '支持 Apple Music、Spotify，以及任何使用 macOS 原生媒体控制的应用，例如 Safari 或 Chrome 中的 YouTube。',
            '¿Cómo activo el Launchpad?': '如何打开控制面板？',
            'Solo tienes que pasar el cursor sobre el notch y hacer click. Puedes configurar las herramientas rápidas desde los ajustes de la aplicación (icono de engranaje en el notch expandido).': '把指针移到刘海上并点击即可。你可以通过展开刘海中的齿轮图标，在应用设置里配置快捷工具。',
            '¿Es de pago único?': '是一次购买吗？',
            'Sí. Odiamos las suscripciones tanto como tú. Un único pago y tendrás acceso a todas las funciones y actualizaciones futuras para siempre.': '是的。一次购买即可永久使用所有已包含的功能和后续更新。',
            '¿Es seguro?': '安全吗？',
            'Totalmente. VibeNotch no recopila datos. No necesita conexión a internet para funcionar (excepto para descargar carátulas si así lo deseas) y no tiene acceso a tus archivos privados.': '完全安全。VibeNotch 不收集数据，无需联网即可运行（按需下载封面除外），也无法访问你的私人文件。',
            '¿Aún tienes dudas?': '还有问题？',
            'Si no has encontrado la respuesta que buscabas, escríbenos directamente.': '如果没有找到需要的答案，请直接联系我们。',
            '@aleixxet en Instagram': 'Instagram：@aleixxet',
            'Política de Privacidad': '隐私政策',
            'Actualizado el 11 de enero de 2026': '更新于 2026 年 1 月 11 日',
            'Tu privacidad es lo primero': '隐私始终优先',
            'VibeNotch no recopila, almacena ni transmite ningún dato personal. Toda la información permanece en tu dispositivo.': 'VibeNotch 不收集、存储或传输任何个人数据。所有信息都保留在你的设备上。',
            'Resumen': '概览',
            'VibeNotch está diseñado con un principio simple: tu Mac es tuyo. No recopilamos datos, no hay análisis de uso, no hay servidores externos. La aplicación funciona completamente offline.': 'VibeNotch 坚持一个简单原则：你的 Mac 属于你。我们不收集数据、不进行使用分析，也没有外部服务器。应用可完全离线运行。',
            'Información que accedemos': '应用访问的信息',
            'Para ofrecer sus funciones, VibeNotch accede a cierta información del sistema. Esta información nunca sale de tu dispositivo.': '为了提供功能，VibeNotch 会访问部分系统信息。这些信息绝不会离开你的设备。',
            'Reproducción musical': '媒体播放',
            'Qué': '内容',
            'Título, artista, álbum y carátula': '标题、艺人、专辑与封面',
            'Para qué': '用途',
            'Mostrar "Reproduciendo ahora"': '显示“正在播放”',
            'Almacenado': '存储',
            'Solo en memoria RAM': '仅保存在内存中',
            'Transmitido': '传输',
            'Nunca': '从不',
            'Estado del sistema': '系统状态',
            'Batería, Wi-Fi, Bluetooth, silencio': '电池、Wi-Fi、蓝牙与静音状态',
            'Notificaciones del notch': '刘海通知',
            'Preferencias': '偏好设置',
            'Tus ajustes de la aplicación': '你的应用设置',
            'Recordar tu configuración': '记住你的配置',
            'Localmente en tu Mac': '本地存储在 Mac 上',
            'Lo que NO recopilamos': '我们不会收集的内容',
            'Información personal identificable': '可识别个人身份的信息',
            'Datos de ubicación': '位置数据',
            'Análisis de uso o estadísticas': '使用分析或统计数据',
            'Informes de errores automáticos': '自动崩溃报告',
            'Identificadores de publicidad': '广告标识符',
            'Datos de navegación o historial': '浏览数据或历史记录',
            'Conexión a internet': '互联网连接',
            'VibeNotch puede conectarse a internet únicamente para obtener carátulas de álbum cuando no están disponibles localmente, usando la API pública de iTunes. No se transmite información personal en esta solicitud.': '只有在本地没有专辑封面时，VibeNotch 才可能通过公开的 iTunes API 联网获取封面。此请求不会传输个人信息。',
            'No hay telemetría. No hay analytics. No hay servidores propios.': '没有遥测、没有分析，也没有自有服务器。',
            'Integraciones': '集成',
            'VibeNotch se integra con Apple Music y Spotify para mostrar información de reproducción. Estas integraciones funcionan completamente en tu dispositivo a través de las APIs del sistema.': 'VibeNotch 与 Apple Music 和 Spotify 集成以显示播放信息。这些集成通过系统 API 完全在设备上运行。',
            'Resumen de datos': '数据概览',
            'Dato': '数据',
            'Recopilado': '收集',
            'Compartido': '共享',
            'Info musical': '媒体信息',
            'No': '否',
            'Sistema': '系统',
            'Local': '本地',
            'Contacto': '联系方式',
            'Si tienes preguntas sobre esta política de privacidad:': '如果你对本隐私政策有任何疑问：',
            'Diseñado con privacidad en mente': '以隐私为核心设计',
            'Tus datos nunca salen de tu Mac.': '你的数据永远不会离开 Mac。'
        }
    };

    const ui = {
        es: {
            language: 'Idioma',
            menu: 'Abrir menú',
            mute: '🔇 Silencio',
            sound: '🔊 Sonido',
            pause: '⏸ Pausar',
            play: '▶ Reproducir',
            playing: 'REPRODUCIENDO',
            paused: 'PAUSADO',
            soundControl: 'Activar o desactivar el sonido del vídeo',
            playbackControl: 'Reproducir o pausar el vídeo',
            trailerTitle: 'Tráiler de VibeNotch Sports'
        },
        en: {
            language: 'Language',
            menu: 'Open menu',
            mute: '🔇 Muted',
            sound: '🔊 Sound',
            pause: '⏸ Pause',
            play: '▶ Play',
            playing: 'PLAYING',
            paused: 'PAUSED',
            soundControl: 'Toggle video sound',
            playbackControl: 'Play or pause the video',
            trailerTitle: 'VibeNotch Sports trailer'
        },
        zh: {
            language: '语言',
            menu: '打开菜单',
            mute: '🔇 静音',
            sound: '🔊 声音',
            pause: '⏸ 暂停',
            play: '▶ 播放',
            playing: '正在播放',
            paused: '已暂停',
            soundControl: '切换视频声音',
            playbackControl: '播放或暂停视频',
            trailerTitle: 'VibeNotch Sports 预告片'
        }
    };

    const metadata = {
        home: {
            es: ['VibeNotch | La Interacción Redefinida', 'La utilidad de notch más óptima y leal del mercado, programada nativa en Swift.'],
            en: ['VibeNotch | Redefine Your Notch', 'A fast, faithful notch utility for macOS, built natively in Swift.'],
            zh: ['VibeNotch | 重新定义 Mac 刘海', '原生 Swift 打造的快速、可靠 macOS 刘海工具。']
        },
        support: {
            es: ['Soporte de VibeNotch', 'Respuestas y ayuda para sacar el máximo partido a VibeNotch.'],
            en: ['VibeNotch Support', 'Answers and help to get the most from VibeNotch.'],
            zh: ['VibeNotch 支持', '获取答案与帮助，充分发挥 VibeNotch 的价值。']
        },
        privacy: {
            es: ['Privacidad de VibeNotch', 'Consulta cómo VibeNotch protege tus datos y funciona de forma privada en tu Mac.'],
            en: ['VibeNotch Privacy', 'Learn how VibeNotch protects your data and runs privately on your Mac.'],
            zh: ['VibeNotch 隐私', '了解 VibeNotch 如何保护数据并在 Mac 上私密运行。']
        }
    };

    const attributeSources = new WeakMap();
    const textSources = new WeakMap();
    const ignoredDynamicIds = new Set(['promo-mute-btn', 'promo-play-btn']);
    const translatableSources = new Set(Object.values(copy).flatMap(language => Object.keys(language)));

    const normalize = value => value.replace(/\s+/g, ' ').trim();

    function preferredLanguage() {
        const requested = new URLSearchParams(window.location.search).get('lang');
        if (supportedLanguages.includes(requested)) return requested;

        const saved = window.localStorage.getItem(storageKey);
        if (supportedLanguages.includes(saved)) return saved;

        const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
        for (const browserLanguage of browserLanguages) {
            const candidate = browserLanguage.toLowerCase();
            if (candidate.startsWith('zh')) return 'zh';
            if (candidate.startsWith('es')) return 'es';
        }
        return 'en';
    }

    function translateSource(source, language) {
        return copy[language]?.[source] ?? source;
    }

    function translateTextNode(node, language) {
        if (ignoredDynamicIds.has(node.parentElement?.id)) return;

        if (!textSources.has(node)) {
            const source = normalize(node.nodeValue || '');
            if (!source || !translatableSources.has(source)) return;
            textSources.set(node, {
                source,
                leading: node.nodeValue.match(/^\s*/)?.[0] ?? '',
                trailing: node.nodeValue.match(/\s*$/)?.[0] ?? ''
            });
        }

        const original = textSources.get(node);
        node.nodeValue = `${original.leading}${translateSource(original.source, language)}${original.trailing}`;
    }

    function translateAttributes(element, language) {
        const attributes = ['aria-label', 'alt', 'placeholder', 'title'];
        let originals = attributeSources.get(element);
        if (!originals) {
            originals = new Map();
            attributeSources.set(element, originals);
        }

        attributes.forEach(attribute => {
            if (!element.hasAttribute(attribute)) return;
            if (!originals.has(attribute)) {
                const source = normalize(element.getAttribute(attribute) || '');
                if (!translatableSources.has(source)) return;
                originals.set(attribute, source);
            }
            const source = originals.get(attribute);
            if (source) element.setAttribute(attribute, translateSource(source, language));
        });
    }

    function translateDocument(language) {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const tag = node.parentElement?.tagName;
                if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(tag)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        while (walker.nextNode()) translateTextNode(walker.currentNode, language);
        document.querySelectorAll('[aria-label], [alt], [placeholder], [title]').forEach(element => {
            translateAttributes(element, language);
        });
    }

    function renderHero(language) {
        const hero = document.querySelector('.hero-title');
        if (!hero) return;

        const heroCopy = {
            es: { giant: ['El', 'notch'], soul: ['más', 'óptimo.'], aria: 'El notch más óptimo.' },
            en: { giant: ['The', 'notch'], soul: ['at', 'its', 'best.'], aria: 'The notch at its best.' },
            zh: { giant: ['你的刘海'], soul: ['更进一步。'], aria: '让你的刘海更进一步。' }
        }[language];

        let letterIndex = 0;
        const giant = heroCopy.giant.map((word, wordIndex) => {
            const letters = [...word].map(letter => {
                const span = `<span class="l" style="--j:${letterIndex}">${letter}</span>`;
                letterIndex += 1;
                return span;
            }).join('');
            return `<span class="w" style="--i:${wordIndex}">${letters}</span>`;
        }).join(' ');
        const soul = heroCopy.soul.map((word, index) => (
            `<span class="w" style="--i:${heroCopy.giant.length + index}">${word}</span>`
        )).join(' ');

        hero.setAttribute('aria-label', heroCopy.aria);
        hero.innerHTML = `<span class="giant" aria-hidden="true">${giant}</span><span class="soul" aria-hidden="true">${soul}</span>`;
    }

    function pageKind() {
        if (window.location.pathname.endsWith('/support.html')) return 'support';
        if (window.location.pathname.endsWith('/privacy.html')) return 'privacy';
        return 'home';
    }

    function applyMetadata(language) {
        const [title, description] = metadata[pageKind()][language];
        document.title = title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', description);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);

        let locale = document.querySelector('meta[property="og:locale"]');
        if (!locale) {
            locale = document.createElement('meta');
            locale.setAttribute('property', 'og:locale');
            document.head.appendChild(locale);
        }
        locale.setAttribute('content', { es: 'es_ES', en: 'en_US', zh: 'zh_CN' }[language]);
    }

    function syncLocalizedLinks(language) {
        document.querySelectorAll('a[href]').forEach(link => {
            const raw = link.getAttribute('href');
            if (!raw || raw.startsWith('#')) return;

            let target;
            try {
                target = new URL(raw, window.location.href);
            } catch {
                return;
            }
            if (target.origin !== window.location.origin) return;

            const localizedPaths = new Set(['/', '/index.html', '/support.html', '/privacy.html']);
            if (!localizedPaths.has(target.pathname)) return;
            target.searchParams.set('lang', language);
            link.setAttribute('href', `${target.pathname}${target.search}${target.hash}`);
        });
    }

    function createLanguagePicker(language) {
        const nav = document.querySelector('.nav-content');
        if (!nav || document.querySelector('.language-switcher')) return;

        const wrapper = document.createElement('label');
        wrapper.className = 'language-switcher';
        wrapper.innerHTML = `
            <span class="language-icon" aria-hidden="true">◎</span>
            <select class="language-select">
                <option value="es">ES</option>
                <option value="en">EN</option>
                <option value="zh">中文</option>
            </select>
        `;

        const picker = wrapper.querySelector('select');
        picker.value = language;
        picker.setAttribute('aria-label', ui[language].language);
        picker.addEventListener('change', event => setLanguage(event.target.value, true));

        const menu = nav.querySelector('.menu-toggle');
        nav.insertBefore(wrapper, menu || null);
    }

    function updateLanguagePicker(language) {
        const picker = document.querySelector('.language-select');
        if (!picker) return;
        picker.value = language;
        picker.setAttribute('aria-label', ui[language].language);
    }

    function setLanguage(language, userInitiated = false) {
        if (!supportedLanguages.includes(language)) return;

        window.localStorage.setItem(storageKey, language);
        document.documentElement.lang = language === 'zh' ? 'zh-Hans' : language;
        document.documentElement.dataset.language = language;

        translateDocument(language);
        renderHero(language);
        applyMetadata(language);
        updateLanguagePicker(language);
        syncLocalizedLinks(language);

        if (userInitiated) {
            const url = new URL(window.location.href);
            url.searchParams.set('lang', language);
            window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
        }

        window.dispatchEvent(new CustomEvent('vibenotch:languagechange', {
            detail: { language }
        }));
    }

    const initialLanguage = preferredLanguage();
    window.VibeNotchI18n = {
        get language() { return document.documentElement.dataset.language || initialLanguage; },
        setLanguage,
        t(key, fallback = key) {
            const language = document.documentElement.dataset.language || initialLanguage;
            return ui[language]?.[key] ?? fallback;
        }
    };

    createLanguagePicker(initialLanguage);
    setLanguage(initialLanguage);
})();
