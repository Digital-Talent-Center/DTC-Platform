<?php

namespace App\Http\Controllers;

/**
 * Helper trait for converting API responses from snake_case to camelCase
 * to match frontend TypeScript interface expectations.
 */
trait ApiResponseHelper
{
    /**
     * Convert array keys from snake_case to camelCase recursively
     */
    protected function toCamelCase(mixed $data): mixed
    {
        if ($data instanceof \Illuminate\Database\Eloquent\Model) {
            $data = $data->toArray();
        }

        if ($data instanceof \Illuminate\Database\Eloquent\Collection || $data instanceof \Illuminate\Support\Collection) {
            return $data->map(fn ($item) => $this->toCamelCase($item))->values()->all();
        }

        if (!is_array($data)) {
            return $data;
        }

        $result = [];
        foreach ($data as $key => $value) {
            $camelKey = is_string($key) ? lcfirst(str_replace('_', '', ucwords($key, '_'))) : $key;
            
            if (is_array($value)) {
                $result[$camelKey] = $this->toCamelCase($value);
            } elseif ($value instanceof \Illuminate\Database\Eloquent\Model) {
                $result[$camelKey] = $this->toCamelCase($value->toArray());
            } elseif ($value instanceof \Illuminate\Database\Eloquent\Collection || $value instanceof \Illuminate\Support\Collection) {
                $result[$camelKey] = $this->toCamelCase($value);
            } else {
                $result[$camelKey] = $value;
            }
        }

        return $result;
    }

    /**
     * Convert a collection of items to camelCase
     */
    protected function collectionToCamelCase($items): array
    {
        return collect($items)->map(fn ($item) => $this->toCamelCase($item))->values()->all();
    }

    /**
     * Build a paginated response in camelCase format matching FE PaginatedResponse<T>
     */
    protected function paginatedResponse($paginator): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'data' => $this->collectionToCamelCase($paginator->items()),
            'pagination' => [
                'currentPage' => $paginator->currentPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'lastPage' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Build a single-item response in camelCase format matching FE ApiResponse<T>
     */
    protected function apiResponse($data, ?string $message = null, int $status = 200): \Illuminate\Http\JsonResponse
    {
        $response = [
            'data' => $this->toCamelCase($data),
        ];

        if ($message) {
            $response['message'] = $message;
        }

        return response()->json($response, $status);
    }

    /**
     * Build a message-only response
     */
    protected function messageResponse(string $message, int $status = 200): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], $status);
    }
}
