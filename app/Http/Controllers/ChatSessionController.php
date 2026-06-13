<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use Illuminate\Http\Request;

class ChatSessionController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->chatSessions()->orderBy('updated_at', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'botpress_conversation_id' => 'required|string',
            'title' => 'nullable|string'
        ]);

        $session = $request->user()->chatSessions()->updateOrCreate(
            ['botpress_conversation_id' => $request->botpress_conversation_id],
            ['title' => $request->title ?? 'Percakapan Baru']
        );

        // Update the timestamp if it already existed so it bumps to the top
        $session->touch();

        return response()->json($session);
    }

    public function destroy(Request $request, ChatSession $chatSession)
    {
        if ($chatSession->user_id !== $request->user()->id) {
            abort(403);
        }
        $chatSession->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function destroyAll(Request $request)
    {
        $request->user()->chatSessions()->delete();
        return response()->json(['message' => 'All deleted']);
    }
}
