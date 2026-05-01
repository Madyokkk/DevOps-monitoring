pipeline {
  agent any

  environment {
    COMPOSE_PROJECT_NAME = 'rk-production'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate') {
      steps {
        sh 'test -f .env || cp .env.example .env'
        sh 'docker compose config --quiet'
        sh 'docker run --rm -v "$PWD/monitoring/prometheus:/etc/prometheus:ro" prom/prometheus:v2.55.1 promtool check config /etc/prometheus/prometheus.yml'
        sh 'docker run --rm -v "$PWD/monitoring/alertmanager:/etc/alertmanager:ro" prom/alertmanager:v0.27.0 amtool check-config /etc/alertmanager/alertmanager.yml'
      }
    }

    stage('Build') {
      steps {
        sh 'docker compose build app api nginx telegram-bot'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose up -d --remove-orphans'
      }
    }

    stage('Smoke') {
      steps {
        sh 'docker compose ps'
        sh 'docker compose exec -T api wget -qO- http://127.0.0.1:3001/health'
        sh 'docker compose exec -T telegram-bot python - <<PY\nimport urllib.request\nprint(urllib.request.urlopen("http://127.0.0.1:5001/health", timeout=5).read().decode())\nPY'
      }
    }
  }

  post {
    failure {
      sh 'docker compose logs --tail=200 || true'
    }
  }
}
