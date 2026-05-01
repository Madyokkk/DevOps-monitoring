FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends fail2ban && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir aiohttp==3.11.11

COPY bot.py .

EXPOSE 5001
CMD ["python", "bot.py"]
