import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private httpClient: HttpClient) {
    }

    get<T>(url: string, options?: Option): Promise<T> {
        url = this.prepareUrl(url);

        return this.httpClient.get<T>(url, options)
            .toPromise()
            .then((resp: any) => {
                if (resp && (resp as any).errorMessage) {
                    throw new Error((resp as any).errorMessage);
                } else {
                    return resp;
                }
            });
    }

    delete<T>(url: string, options?: Option): Promise<T> {
        url = this.prepareUrl(url);

        return this.httpClient.delete<T>(url, options)
            .toPromise()
            .then(resp => {
                if (resp && (resp as any).errorMessage) {
                    throw new Error((resp as any).errorMessage);
                } else {
                    return resp;
                }
            });
    }

    post<T>(url: string, body: any | null, options?: Option): Promise<T> {
        url = this.prepareUrl(url);

        return this.httpClient.post<T>(url, body, options)
            .toPromise()
            .then(resp => {
                if (resp && (resp as any).errorMessage) {
                    throw new Error((resp as any).errorMessage);
                } else {
                    return resp;
                }
            });
    }

    put<T>(url: string, body: any | null, options?: Option): Promise<T> {
        url = this.prepareUrl(url);

        return this.httpClient.put<T>(url, body, options)
            .toPromise()
            .then(resp => {
                if (resp && (resp as any).errorMessage) {
                    throw new Error((resp as any).errorMessage);
                } else {
                    return resp;
                }
            });
    }

    private prepareUrl(url: string): string {
        if (!(url.startsWith('http://') || url.startsWith('https://'))) {
            url = environment.apiUrl + url;
        }
        return url;
    }
}

interface Option {
    headers?: HttpHeaders | {
        [header: string]: string | string[];
    };
    observe?: 'body';
    params?: HttpParams | {
        [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
}
