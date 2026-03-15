<?php

return [
    'provider' => env('AI_PROVIDER', 'ollama'),
    'embedding_provider' => env('AI_EMBEDDING_PROVIDER', 'ollama'),
    'http_timeout' => (int) env('AI_HTTP_TIMEOUT', 8),
    'http_connect_timeout' => (int) env('AI_HTTP_CONNECT_TIMEOUT', 3),
    'max_agent_steps' => (int) env('AI_MAX_AGENT_STEPS', 1),

    'providers' => [
        'ollama' => \App\Services\OllamaService::class,
    ],

    'docs' => [
        'supported_extensions' => ['pdf', 'docx', 'txt', 'md'],
        'chunk_size' => (int) env('AI_DOC_CHUNK_SIZE', 700),
        'chunk_overlap' => (int) env('AI_DOC_CHUNK_OVERLAP', 120),
    ],
];
