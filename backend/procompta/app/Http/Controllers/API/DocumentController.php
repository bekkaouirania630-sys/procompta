<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Document;

class DocumentController extends Controller
{
    public function index()
    {
        return response()->json(Document::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'file_path' => 'nullable|string',
        ]);
        $document = Document::create($validated);
        return response()->json($document, 201);
    }

    public function show($id)
    {
        return response()->json(Document::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $document = Document::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'file_path' => 'nullable|string',
        ]);
        $document->update($validated);
        return response()->json($document);
    }

    public function destroy($id)
    {
        $document = Document::findOrFail($id);
        $document->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
