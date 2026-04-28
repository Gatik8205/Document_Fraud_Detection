import axios from 'axios';
import type { FraudResult } from '../types/fraud';

const API_BASE_URL = import.meta.env.VITE_API_URL;  // ← CHANGED

export async function analyzeDocument(file: File): Promise<FraudResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<FraudResult>(
        `${API_BASE_URL}/analyze`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
}