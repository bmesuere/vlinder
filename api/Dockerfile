# Keep the Ruby minor version in step with .ruby-version. The monthly rebuild picks up its patch releases.
FROM ruby:4.0-slim AS base
ENV BUNDLE_FROZEN=1 \
    BUNDLE_WITHOUT=development:test \
    RACK_ENV=production
WORKDIR /app

FROM base AS build
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libssl-dev \
    && rm -rf /var/lib/apt/lists/*
COPY Gemfile Gemfile.lock ./
RUN bundle install && rm -rf /usr/local/bundle/cache

FROM base
RUN useradd --uid 1000 --create-home --shell /usr/sbin/nologin vlinder
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY . .
USER vlinder
EXPOSE 8080
# The database login is mounted at /app/login.json, see login.example.json.
CMD ["bundle", "exec", "puma", "--bind", "tcp://0.0.0.0:8080"]
