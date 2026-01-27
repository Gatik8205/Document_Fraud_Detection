import axios from 'axios';
import type {FraudResult} from '../types/fraud';

const API_BASE_URL = "http://127.0.0.1:8000";

export async function analyzeDocument(file:File): Promise<FraudResult>{
    const formData = new FormData();
    formData.append('file', file);

    const response= await axios.post<FraudResult>(
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