<?php

namespace App\Services;

use App\Models\Document;
use App\Models\OcrResult;
use App\Models\Tier;
use Illuminate\Support\Facades\Storage;

class OcrService
{
    /**
     * Process a raw OCR text and extract structured data.
     */
    public function processText($text, $documentId, $companyId)
    {
        $extractedData = $this->parseIntelligence($text);

        // Logic: Auto-create draft supplier (Tier) if unknown ICE
        $tier = null;
        if (!empty($extractedData['vendor_ice'])) {
            $tier = Tier::where('ice', $extractedData['vendor_ice'])
                ->where('company_id', $companyId)
                ->first();
            
            if (!$tier && !empty($extractedData['vendor_name'])) {
                $tier = Tier::create([
                    'company_id' => $companyId,
                    'name' => $extractedData['vendor_name'] . ' (Auto-OCR)',
                    'ice' => $extractedData['vendor_ice'],
                    'if' => $extractedData['vendor_if'] ?? null,
                    'type' => 'fournisseur',
                    'status' => 'brouillon',
                ]);
            }
        }

        $ocrResult = OcrResult::updateOrCreate(
            ['document_id' => $documentId],
            [
                'extracted_data' => $extractedData,
                'is_verified' => false
            ]
        );

        Document::where('id', $documentId)->update(['status' => 'analysé']);

        return [
            'ocr_result' => $ocrResult,
            'tier' => $tier
        ];
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

        // 2. Extract IF
        if (preg_match('/(?:IF|Identifiant Fiscal)\s*[:.]?\s*(\d{7,10})/i', $text, $matches)) {
            $data['vendor_if'] = $matches[1];
        }

        // 3. Extract Invoice Number
        if (preg_match('/(?:Facture|N|Invoice)\s*(?:N|Ref|Num)?\s*[:.]?\s*([A-Z0-9\-\/]{4,15})/i', $text, $matches)) {
            $data['invoice_number'] = $matches[1];
        }

        // 4. Extract Amounts
        if (preg_match('/(?:TTC|Total TTC|Net  payer)\s*[:.]?\s*([\d\s,]+(?:[\.\,]\d{2})?)/i', $text, $matches)) {
            $data['amount_ttc'] = (float) str_replace([' ', ','], ['', '.'], $matches[1]);
            $data['amount_ht'] = round($data['amount_ttc'] / 1.2, 2);
            $data['amount_tva'] = round($data['amount_ttc'] - $data['amount_ht'], 2);
        }

        $lines = explode("\n", $text);
        if (count($lines) > 0) {
            $data['vendor_name'] = trim($lines[0]);
        }

        return $data;
    }
}
