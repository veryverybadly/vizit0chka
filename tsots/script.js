// Конфигурация пути
const BASE_PATH = '/vizitOchka/tsots/';

// Ключ для хранения в localStorage
const STORAGE_KEY = 'tsotsi_links';

// Загрузка существующих ссылок
let links = loadLinks();

function loadLinks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

function saveLinks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

function generateShortCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function isValidCustomCode(code) {
    return /^[a-zA-Z0-9_-]+$/.test(code) && code.length >= 3 && code.length <= 20;
}

function shortenUrl() {
    const longUrl = document.getElementById('longUrl').value.trim();
    const customCode = document.getElementById('customCode').value.trim();
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');

    // Скрываем предыдущие результаты
    errorDiv.classList.remove('show');
    resultDiv.classList.remove('show');

    // Валидация URL
    if (!longUrl) {
        showError('Пожалуйста, введите ссылку');
        return;
    }

    if (!isValidUrl(longUrl)) {
        showError('Пожалуйста, введите корректный URL (включая http:// или https://)');
        return;
    }

    let shortCode;

    // Обработка кастомного кода
    if (customCode) {
        if (!isValidCustomCode(customCode)) {
            showError('Кастомный код должен содержать только латиницу, цифры, - и _, длиной 3-20 символов');
            return;
        }

        if (links[customCode]) {
            showError('Этот короткий код уже используется. Пожалуйста, выберите другой.');
            return;
        }

        shortCode = customCode;
    } else {
        // Генерируем уникальный код
        do {
            shortCode = generateShortCode();
        } while (links[shortCode]);
    }

    // Сохраняем ссылку
    links[shortCode] = {
        url: longUrl,
        created: new Date().toISOString(),
        clicks: 0
    };
    saveLinks();

    // Формируем полную короткую ссылку
    const fullUrl = window.location.origin + BASE_PATH + shortCode;
    document.getElementById('shortUrl').value = fullUrl;
    resultDiv.classList.add('show');

    // Очищаем поля
    document.getElementById('longUrl').value = '';
    document.getElementById('customCode').value = '';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function copyToClipboard() {
    const shortUrlInput = document.getElementById('shortUrl');
    shortUrlInput.select();
    shortUrlInput.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(shortUrlInput.value).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        showError('Не удалось скопировать ссылку');
    });
}

// Обработка перехода по короткой ссылке
function handleRedirect() {
    // Получаем путь после BASE_PATH
    const fullPath = window.location.pathname;
    
    // Проверяем, начинается ли путь с BASE_PATH
    if (fullPath.startsWith(BASE_PATH)) {
        const shortCode = fullPath.substring(BASE_PATH.length);
        
        // Если это корневая страница или admin
        if (shortCode === '' || shortCode === 'index.html') {
            return;
        }
        
        // Если это админ-панель
        if (shortCode === 'admin') {
            showAdminPanel();
            return;
        }
        
        // Проверяем существование ссылки
        if (links[shortCode]) {
            // Увеличиваем счетчик кликов
            links[shortCode].clicks++;
            saveLinks();
            
            // Перенаправляем на оригинальный URL
            window.location.href = links[shortCode].url;
        } else if (shortCode && shortCode !== '') {
            // Если ссылка не найдена, показываем страницу 404
            document.body.innerHTML = `
                <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                    <h1 style="color: #667eea;">цоцы</h1>
                    <h2>Ссылка не найдена 😕</h2>
                    <p>Короткая ссылка "${shortCode}" не существует или была удалена.</p>
                    <a href="${BASE_PATH}" style="color: #667eea; text-decoration: none;">← Создать новую ссылку</a>
                </div>
            `;
        }
    }
}

// Админ-панель для просмотра статистики
function showAdminPanel() {
    const linksList = Object.entries(links);
    
    if (linksList.length === 0) {
        document.body.innerHTML = `
            <div style="max-width: 800px; margin: 50px auto; padding: 20px; font-family: Arial, sans-serif;">
                <h1 style="color: #667eea;">цоцы - Админ панель</h1>
                <p>Ссылок пока нет</p>
                <a href="${BASE_PATH}">← На главную</a>
            </div>
        `;
        return;
    }

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <base href="/">
            <title>цоцы - Админ панель</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: #f5f5f5;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #667eea;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                }
                th {
                    background: #f8f9fa;
                    font-weight: bold;
                    color: #333;
                }
                tr:hover {
                    background: #f8f9fa;
                }
                .badge {
                    background: #28a745;
                    color: white;
                    padding: 3px 8px;
                    border-radius: 5px;
                    font-size: 12px;
                }
                .back-link {
                    display: inline-block;
                    margin-top: 20px;
                    color: #667eea;
                    text-decoration: none;
                }
                .short-link {
                    color: #667eea;
                    text-decoration: none;
                }
                .delete-btn {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                }
                .delete-btn:hover {
                    background: #c82333;
                }
                @media (max-width: 768px) {
                    .container {
                        padding: 10px;
                    }
                    th, td {
                        padding: 8px;
                        font-size: 12px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📊 цоцы - Статистика ссылок</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Короткий код</th>
                            <th>Оригинальная ссылка</th>
                            <th>Переходов</th>
                            <th>Дата создания</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    linksList.forEach(([code, data]) => {
        const shortUrl = window.location.origin + BASE_PATH + code;
        html += `
            <tr>
                <td><a href="${shortUrl}" target="_blank" style="color: #667eea;">/${code}</a></td>
                <td><a href="${data.url}" target="_blank" style="color: #667eea;">${data.url.substring(0, 50)}${data.url.length > 50 ? '...' : ''}</a></td>
                <td><span class="badge">${data.clicks || 0}</span></td>
                <td>${new Date(data.created).toLocaleString('ru-RU')}</td>
                <td><button class="delete-btn" onclick="deleteLink('${code}')">Удалить</button></td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
                <a href="${BASE_PATH}" class="back-link">← Вернуться на главную</a>
            </div>
            <script>
                function deleteLink(code) {
                    if (confirm('Удалить ссылку /' + code + '?')) {
                        let links = JSON.parse(localStorage.getItem('${STORAGE_KEY}') || '{}');
                        delete links[code];
                        localStorage.setItem('${STORAGE_KEY}', JSON.stringify(links));
                        location.reload();
                    }
                }
            <\/script>
        </body>
        </html>
    `;

    document.write(html);
    document.close();
}

// Инициализация - запускаем после загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        handleRedirect();
    });
} else {
    handleRedirect();
}
