import asyncio
import html
import ipaddress
import os
from datetime import datetime
from typing import Any

import aiohttp
from aiohttp import web


BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("BOT_TOKEN", "")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID") or os.environ.get("CHAT_ID", "")
PROMETHEUS_URL = os.environ.get("PROMETHEUS_URL", "http://prometheus:9090").rstrip("/")
LISTEN_HOST = os.environ.get("BOT_LISTEN_HOST", "0.0.0.0")
LISTEN_PORT = int(os.environ.get("BOT_LISTEN_PORT", "5001"))
HTTP_TIMEOUT = aiohttp.ClientTimeout(total=10)


def now() -> str:
    return datetime.now().strftime("%d.%m.%Y %H:%M:%S")


def icon(value: float | None, warning: float = 70, critical: float = 85) -> str:
    if value is None:
        return "⚪"
    if value >= critical:
        return "🔴"
    if value >= warning:
        return "🟡"
    return "🟢"


def fmt(value: float | None, unit: str = "%") -> str:
    return f"{value:.1f}{unit}" if value is not None else "N/A"


async def telegram_api(
    session: aiohttp.ClientSession,
    method: str,
    payload: dict[str, Any],
    timeout: aiohttp.ClientTimeout | None = None,
) -> dict[str, Any]:
    if not BOT_TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not configured")

    async with session.post(f"https://api.telegram.org/bot{BOT_TOKEN}/{method}", json=payload, timeout=timeout) as response:
        data = await response.json(content_type=None)
        if not response.ok or not data.get("ok"):
            raise RuntimeError(f"Telegram API error {response.status}: {data}")
        return data


async def send_telegram(session: aiohttp.ClientSession, text: str, chat_id: str | None = None) -> None:
    target = chat_id or CHAT_ID
    if not target:
        raise RuntimeError("TELEGRAM_CHAT_ID is not configured")
    await telegram_api(
        session,
        "sendMessage",
        {
            "chat_id": target,
            "text": text[:3900],
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        },
    )


async def query_prometheus(session: aiohttp.ClientSession, query: str) -> dict[str, Any]:
    async with session.get(f"{PROMETHEUS_URL}/api/v1/query", params={"query": query}) as response:
        data = await response.json(content_type=None)
        if not response.ok or data.get("status") != "success":
            raise RuntimeError(f"Prometheus query failed: {query}: {data}")
        return data


async def get_metric(session: aiohttp.ClientSession, query: str) -> float | None:
    try:
        data = await query_prometheus(session, query)
        results = data.get("data", {}).get("result", [])
        return float(results[0]["value"][1]) if results else None
    except Exception as exc:
        print(f"[PROMETHEUS] {query}: {exc}", flush=True)
        return None


async def http_status(session: aiohttp.ClientSession, name: str, url: str) -> str:
    started = asyncio.get_running_loop().time()
    try:
        async with session.get(url, allow_redirects=False) as response:
            elapsed_ms = int((asyncio.get_running_loop().time() - started) * 1000)
            marker = "✅" if 200 <= response.status < 400 else "❌"
            return f"{marker} <code>{html.escape(name)}</code> — HTTP {response.status}, {elapsed_ms}ms"
    except Exception as exc:
        return f"❌ <code>{html.escape(name)}</code> — {html.escape(type(exc).__name__)}"


async def cmd_cpu(session: aiohttp.ClientSession) -> str:
    linux = await get_metric(session, '100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)')
    windows = await get_metric(session, '100 - (avg(rate(windows_cpu_time_total{mode="idle"}[1m])) * 100)')
    return (
        "<b>🖥 CPU</b>\n"
        "━━━━━━━━━━━━━━━━\n"
        f"{icon(linux)} <b>Linux:</b> <code>{fmt(linux)}</code>\n"
        f"{icon(windows)} <b>Windows:</b> <code>{fmt(windows)}</code>\n"
        "━━━━━━━━━━━━━━━━\n"
        f"<i>🕐 {now()}</i>"
    )


async def cmd_memory(session: aiohttp.ClientSession) -> str:
    used = await get_metric(session, "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100")
    total = await get_metric(session, "node_memory_MemTotal_bytes / 1024 / 1024 / 1024")
    available = await get_metric(session, "node_memory_MemAvailable_bytes / 1024 / 1024 / 1024")
    windows = await get_metric(session, "(1 - (windows_memory_available_bytes / windows_cs_physical_memory_bytes)) * 100")
    return (
        "<b>💾 RAM</b>\n"
        "━━━━━━━━━━━━━━━━\n"
        f"🐧 <b>Linux:</b> {icon(used)} <code>{fmt(used)}</code>\n"
        f"📊 Всего: <code>{fmt(total, ' GB')}</code>\n"
        f"✅ Свободно: <code>{fmt(available, ' GB')}</code>\n"
        f"🪟 <b>Windows:</b> {icon(windows)} <code>{fmt(windows)}</code>\n"
        "━━━━━━━━━━━━━━━━\n"
        f"<i>🕐 {now()}</i>"
    )


async def cmd_disk(session: aiohttp.ClientSession) -> str:
    used = await get_metric(
        session,
        '(1 - node_filesystem_avail_bytes{mountpoint="/",fstype!~"tmpfs|overlay|squashfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!~"tmpfs|overlay|squashfs"}) * 100',
    )
    total = await get_metric(session, 'node_filesystem_size_bytes{mountpoint="/",fstype!~"tmpfs|overlay|squashfs"} / 1024 / 1024 / 1024')
    available = await get_metric(session, 'node_filesystem_avail_bytes{mountpoint="/",fstype!~"tmpfs|overlay|squashfs"} / 1024 / 1024 / 1024')
    windows = await get_metric(session, '100 - (windows_logical_disk_free_bytes{volume="C:"} / windows_logical_disk_size_bytes{volume="C:"} * 100)')
    return (
        "<b>💿 Диск</b>\n"
        "━━━━━━━━━━━━━━━━\n"
        f"🐧 <b>Linux /:</b> {icon(used, 60, 80)} <code>{fmt(used)}</code>\n"
        f"📊 Всего: <code>{fmt(total, ' GB')}</code>\n"
        f"✅ Свободно: <code>{fmt(available, ' GB')}</code>\n"
        f"🪟 <b>Windows C:</b> {icon(windows, 60, 80)} <code>{fmt(windows)}</code>\n"
        "━━━━━━━━━━━━━━━━\n"
        f"<i>🕐 {now()}</i>"
    )


async def cmd_site(session: aiohttp.ClientSession) -> str:
    checks = [
        ("Site", "http://app:3000/"),
        ("API health", "http://api:3001/health"),
        ("Prometheus", "http://prometheus:9090/-/healthy"),
        ("Grafana", "http://grafana:3000/api/health"),
        ("n8n", "http://n8n:5678/healthz"),
        ("Alertmanager", "http://alertmanager:9093/-/healthy"),
    ]
    lines = await asyncio.gather(*(http_status(session, name, url) for name, url in checks))
    avg = await get_metric(session, "avg(scrape_duration_seconds)")
    return (
        "<b>🌐 Сервисы проекта</b>\n"
        "━━━━━━━━━━━━━━━━━━━\n"
        + "\n".join(lines)
        + "\n━━━━━━━━━━━━━━━━━━━\n"
        f"⏱ <b>Avg scrape:</b> <code>{int(avg * 1000) if avg is not None else 'N/A'}ms</code>\n"
        f"<i>🕐 {now()}</i>"
    )


async def _f2b(sock: str, *args: str, timeout: int = 10) -> tuple[int, str, str]:
    proc = await asyncio.create_subprocess_exec(
        "fail2ban-client", "-s", sock, *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    out, err = await asyncio.wait_for(proc.communicate(), timeout=timeout)
    return proc.returncode, out.decode().strip(), err.decode().strip()


async def cmd_banned() -> str:
    sock = "/run/fail2ban/fail2ban.sock"
    try:
        rc, out, err = await _f2b(sock, "status", "nginx-login")
        if rc != 0:
            return f"❌ fail2ban: <code>{html.escape(err or out)}</code>"
        banned_line = next((l for l in out.splitlines() if "Banned IP" in l or "banned IP" in l.lower()), "")
        ips = banned_line.split(":")[-1].strip() if banned_line else "нет"
        return f"🚫 <b>Заблокированные IP</b>\n<code>{html.escape(ips)}</code>"
    except FileNotFoundError:
        return "❌ fail2ban-client не найден в контейнере"
    except asyncio.TimeoutError:
        return "❌ Таймаут"
    except Exception as exc:
        return f"❌ {html.escape(str(exc))}"


async def cmd_unban(ip_str: str) -> str:
    try:
        ip = str(ipaddress.ip_address(ip_str))
    except ValueError:
        return f"❌ Некорректный IP-адрес: <code>{html.escape(ip_str)}</code>"
    sock = "/run/fail2ban/fail2ban.sock"
    try:
        # check daemon is alive
        rc, _, err = await _f2b(sock, "ping", timeout=5)
        if rc != 0:
            if "Connection refused" in err or "refused" in err.lower():
                return "❌ fail2ban не запущен\n<code>systemctl start fail2ban</code>"
            return f"❌ fail2ban ping: <code>{html.escape(err)}</code>"

        # unbanip triggers actionunban → removes from banned.conf + nginx reload
        rc1, out1, err1 = await _f2b(sock, "set", "nginx-login", "unbanip", ip)
        # global unban covers any other jails
        await _f2b(sock, "unban", ip)

        # verify the IP is no longer in the jail
        _, status_out, _ = await _f2b(sock, "status", "nginx-login")
        if ip in status_out:
            return (
                f"⚠️ IP <code>{ip}</code> всё ещё в списке бана\n"
                f"Вывод unban: <code>{html.escape((out1 or err1)[:200])}</code>"
            )

        if rc1 != 0 and "is not banned" in (out1 + err1).lower():
            return (
                f"⚠️ IP <code>{ip}</code> не был забанен в nginx-login\n"
                "Проверь /banned — возможно, реальный IP другой (Docker proxy)"
            )

        return f"✅ IP <code>{ip}</code> разблокирован"
    except FileNotFoundError:
        return "❌ fail2ban-client не найден в контейнере"
    except asyncio.TimeoutError:
        return "❌ Таймаут при выполнении команды"
    except Exception as exc:
        return f"❌ {html.escape(str(exc))}"


async def cmd_status(session: aiohttp.ClientSession) -> str:
    cpu = await get_metric(session, '100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)')
    memory = await get_metric(session, "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100")
    disk = await get_metric(
        session,
        '(1 - node_filesystem_avail_bytes{mountpoint="/",fstype!~"tmpfs|overlay|squashfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!~"tmpfs|overlay|squashfs"}) * 100',
    )
    boot = await get_metric(session, "node_boot_time_seconds")
    uptime = "N/A"
    if boot is not None:
        seconds = max(0, int(datetime.now().timestamp() - boot))
        uptime = f"{seconds // 3600}ч {(seconds % 3600) // 60}мин"
    site = await http_status(session, "Site", "http://app:3000/")
    api = await http_status(session, "API", "http://api:3001/health")
    return (
        "<b>📊 Статус системы</b>\n"
        "━━━━━━━━━━━━━━━━━━━\n"
        f"CPU: {icon(cpu)} <code>{fmt(cpu)}</code>\n"
        f"RAM: {icon(memory)} <code>{fmt(memory)}</code>\n"
        f"Disk: {icon(disk, 60, 80)} <code>{fmt(disk)}</code>\n"
        f"Uptime: <code>{uptime}</code>\n"
        "━━━━━━━━━━━━━━━━━━━\n"
        f"{site}\n"
        f"{api}\n"
        "━━━━━━━━━━━━━━━━━━━\n"
        f"<i>🕐 {now()}</i>"
    )


def help_text() -> str:
    return (
        "<b>🤖 Команды бота</b>\n"
        "━━━━━━━━━━━━━━━━\n"
        "/status — общий статус\n"
        "/cpu — нагрузка CPU\n"
        "/memory — использование RAM\n"
        "/disk — состояние диска\n"
        "/site — сервисы проекта\n"
        "/banned — список забаненных IP\n"
        "/unban &lt;ip&gt; — разбанить IP в fail2ban\n"
        "/help — список команд"
    )


async def process_command(session: aiohttp.ClientSession, text: str, chat_id: str) -> None:
    parts = text.strip().split()
    command = parts[0].lower().split("@")[0]

    if command == "/unban":
        if len(parts) < 2:
            reply = "⚠️ Укажи IP: <code>/unban 1.2.3.4</code>"
        else:
            reply = await cmd_unban(parts[1])
        await send_telegram(session, reply, chat_id)
        return

    if command == "/banned":
        await send_telegram(session, await cmd_banned(), chat_id)
        return

    handlers = {
        "/start": cmd_status,
        "/status": cmd_status,
        "/cpu": cmd_cpu,
        "/memory": cmd_memory,
        "/mem": cmd_memory,
        "/disk": cmd_disk,
        "/site": cmd_site,
        "/sites": cmd_site,
    }
    handler = handlers.get(command)
    reply = help_text() if command in ("/help", "help") or handler is None else await handler(session)
    await send_telegram(session, reply, chat_id)


def format_alert(payload: dict[str, Any]) -> str:
    status = payload.get("status", "firing")
    header = "🚨 <b>АЛЕРТ</b>" if status == "firing" else "✅ <b>ВОССТАНОВЛЕНО</b>"
    lines = [header, "━━━━━━━━━━━━━━━━"]
    for alert in payload.get("alerts", []):
        labels = alert.get("labels", {})
        annotations = alert.get("annotations", {})
        alertname = html.escape(labels.get("alertname", "Alert"))
        severity = html.escape(labels.get("severity", "info"))
        instance = html.escape(labels.get("instance", "n/a"))
        description = html.escape(annotations.get("description") or annotations.get("summary") or "")
        lines.append(f"🔴 <b>{alertname}</b> | <code>{severity}</code>")
        lines.append(f"Узел: <code>{instance}</code>")
        if description:
            lines.append(description)
        lines.append("")
    lines.append("━━━━━━━━━━━━━━━━")
    lines.append(f"<i>🕐 {now()}</i>")
    return "\n".join(lines).strip()


async def handle_alert(request: web.Request) -> web.Response:
    try:
        await send_telegram(request.app["session"], format_alert(await request.json()))
        return web.json_response({"ok": True})
    except Exception as exc:
        print(f"[ALERT] {exc}", flush=True)
        return web.json_response({"ok": False, "error": str(exc)}, status=500)


async def handle_cmd(request: web.Request) -> web.Response:
    try:
        payload = await request.json()
        await process_command(request.app["session"], str(payload.get("command", "/help")), CHAT_ID)
        return web.json_response({"ok": True})
    except Exception as exc:
        print(f"[CMD] {exc}", flush=True)
        return web.json_response({"ok": False, "error": str(exc)}, status=500)


async def handle_health(_: web.Request) -> web.Response:
    return web.json_response({"ok": True, "prometheus": PROMETHEUS_URL})


async def polling(session: aiohttp.ClientSession) -> None:
    offset = 0
    print("[INFO] Telegram polling started", flush=True)
    while True:
        try:
            data = await telegram_api(
                session,
                "getUpdates",
                {"offset": offset, "timeout": 30, "allowed_updates": ["message"]},
                timeout=aiohttp.ClientTimeout(total=40),
            )
            for update in data.get("result", []):
                offset = update["update_id"] + 1
                message = update.get("message") or {}
                text = (message.get("text") or "").strip()
                chat_id = str((message.get("chat") or {}).get("id") or "")
                if not text or not chat_id:
                    continue
                if CHAT_ID and chat_id != CHAT_ID:
                    await send_telegram(session, "Доступ запрещён.", chat_id)
                    continue
                await process_command(session, text, chat_id)
        except Exception as exc:
            print(f"[POLLING] {type(exc).__name__}: {exc!r}", flush=True)
            await asyncio.sleep(5)


async def on_startup(app: web.Application) -> None:
    app["session"] = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10))
    try:
        await telegram_api(app["session"], "deleteWebhook", {"drop_pending_updates": False})
    except Exception as exc:
        print(f"[STARTUP] deleteWebhook failed: {type(exc).__name__}: {exc!r}", flush=True)
    app["polling_task"] = asyncio.create_task(polling(app["session"]))
    try:
        await send_telegram(app["session"], "🤖 <b>Monitoring Bot запущен</b>\n/status /cpu /memory /disk /site")
    except Exception as exc:
        print(f"[STARTUP] Telegram notification failed: {exc}", flush=True)


async def on_cleanup(app: web.Application) -> None:
    app["polling_task"].cancel()
    await app["session"].close()


def create_app() -> web.Application:
    if not BOT_TOKEN or not CHAT_ID:
        raise RuntimeError("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be configured")
    app = web.Application()
    app.router.add_get("/health", handle_health)
    app.router.add_post("/alert", handle_alert)
    app.router.add_post("/cmd", handle_cmd)
    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)
    return app


if __name__ == "__main__":
    web.run_app(create_app(), host=LISTEN_HOST, port=LISTEN_PORT)
