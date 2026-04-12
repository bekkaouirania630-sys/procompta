<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Document;
use App\Models\OcrResult;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OcrController extends Controller
{
    public function index()
    {
        $docs = Document::with('ocrResult')->latest()->paginate(10);
        return response()->json($docs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'type' => 'nullable|string'
        ]);

        $file = $request->file('file');
        $path = $file->store('documents', 'public');

        $document = Document::create([
            'file_path' => $path,
            'type' => $request->type ?? 'facture_fournisseur',
            'status' => 'en_cours'
        ]);

        return response()->json([
            'document' => $document,
            'message' => 'Fichier téléchargé avec succès'
        ], 201);
    }

    public function analyze(Request $request)
    {
        $request->validate([
            'raw_text' => 'required|string',
            'document_id' => 'required|exists:documents,id'
        ]);

        $text = $request->raw_text;
        $extractedData = $this->parseIntelligence($text);

        // Logic: Auto-create draft supplier (Tier) if unknown ICE
        $tier = null;
        if (!empty($extractedData['vendor_ice'])) {
            $tier = \App\Models\Tier::where('ice', $extractedData['vendor_ice'])->first();
            
            if (!$tier && !empty($extractedData['vendor_name'])) {
                $tier = \App\Models\Tier::create([
                    'company_id' => $request->user()->company_id ?? 1,
                    'name' => $extractedData['vendor_name'] . ' (Auto-OCR)',
                    'ice' => $extractedData['vendor_ice'],
                    'if' => $extractedData['vendor_if'] ?? null,
                    'type' => 'fournisseur',
                    'status' => 'brouillon', // Mark as draft for validation
                    'phone' => 'A compléter',
                ]);
            }
        }

        if ($tier) {
            $extractedData['suggested_account'] = $tier->account_id ?? '4411';
            $extractedData['is_new_vendor'] = $tier->wasRecentlyCreated;
        }

        $ocrResult = OcrResult::updateOrCreate(
            ['document_id' => $request->document_id],
            [
                'extracted_data' => $extractedData,
                'is_verified' => false
            ]
        );

        Document::where('id', $request->document_id)->update(['status' => 'analysé']);

        return response()->json([
            'ocr_result' => $ocrResult,
            'is_new_vendor' => $extractedData['is_new_vendor'] ?? false
        ]);
    }

    private function parseIntelligence($text)
    {
        $data = [
            'vendor_name' => 'Inconnu',
            'vendor_ice' => null,
            'vendor_if' => null,
            'invoice_number' => null,
            'date' => date('Y-m-d'),
            'amount_ht' => 0,
            'amount_tva' => 0,
            'amount_ttc' => 0,
            'tva_rate' => 20,
            'currency' => 'MAD'
        ];

        // 1. Extract ICE (15 digits)
        if (preg_match('/\b\d{15}\b/', $text, $matches)) {
            $data['vendor_ice'] = $matches[0];
        }

        // 2. Extract IF (usually 7-8 digits near "IF" or "Identifiant Fiscal")
        if (preg_match('/(?:IF|Identifiant Fiscal)\s*[:.]?\s*(\d{7,10})/i', $text, $matches)) {
            $data['vendor_if'] = $matches[1];
        }

        // 3. Extract Invoice Number
        if (preg_match('/(?:Facture|N|Invoice)\s*(?:N|Ref|Num)?\s*[:.]?\s*([A-Z0-9\-\/]{4,15})/i', $text, $matches)) {
            $data['invoice_number'] = $matches[1];
        }

        // 4. Extract Amounts (Look for T.T.C or Net à payer)
        if (preg_match('/(?:TTC|Total TTC|Net  payer)\s*[:.]?\s*([\d\s,]+(?:[\.\,]\d{2})?)/i', $text, $matches)) {
            $data['amount_ttc'] = (float) str_replace([' ', ','], ['', '.'], $matches[1]);
        }

        // 5. Deduce HT and TVA if possible
        if ($data['amount_ttc'] > 0) {
            $data['amount_ht'] = round($data['amount_ttc'] / 1.2, 2);
            $data['amount_tva'] = round($data['amount_ttc'] - $data['amount_ht'], 2);
        }

        // 6. Name extraction (very heuristic: often first line of the document)
        $lines = explode("\n", $text);
        if (count($lines) > 0) {
            $data['vendor_name'] = trim($lines[0]);
        }

        return $data;
    }

    public function show($id)
    {
        return response()->json(Document::with('ocrResult')->findOrFail($id));
    }

    public function destroy($id)
    {
        $doc = Document::findOrFail($id);
        Storage::disk('public')->delete($doc->file_path);
        $doc->delete();
        return response()->json(['message' => 'Document supprimé']);
    }
}
