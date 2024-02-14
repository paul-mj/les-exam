import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { AppService } from '../app/app.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseURL: string;
    private localUrl: string;

    constructor(
        private http: HttpClient,
        private apiConfig: AppService
    ) {
        this.baseURL = this.apiConfig.config.apiUrl;
        this.localUrl = this.apiConfig.config.localUrl;
    }
    httpGet(arg: { url: string, params?: HttpParams, delay?: any }): Observable<any> {
        const link = `${this.baseURL}/${arg.url}`;
        return this.http.get(link, { params: arg.params });
    }
    httpLocalGet(arg: { url: string, params?: HttpParams }): Observable<any> {
        const link = `${this.localUrl}/${arg.url}`;
        return this.http.get(link, { params: arg.params });
    }
    httpLocalGetText(arg: { url: string, params?: HttpParams }): Observable<any> {
        const link = `${this.localUrl}/${arg.url}`;
        return this.http.get(link, { params: arg.params, responseType: 'text' });
    }
    httpGetBlob(arg: { url: string, params?: HttpParams }): Observable<any> {
        const link = `${this.baseURL}/${arg.url}`;
        return this.http.get(link, { params: arg.params, responseType: 'blob' });
    }
    httpGetBlobCustomUrl(arg: { url: string, params?: HttpParams }): Observable<any> {
        const link = `${arg.url}`;
        return this.http.get(link, { params: arg.params, responseType: 'blob' });
    }
    httpGetText(arg: { url: string, params?: HttpParams }): Observable<any> {
        const link = `${arg.url}`;
        return this.http.get(link, { params: arg.params, responseType: 'text' });
    }
    httpPost<T>(arg: { url: string, data?: T, delay?: any }): Observable<any> {
        const link = `${this.baseURL}/${arg.url}`;
        if (arg.delay) {
            const httpOptions = this.getOptions(arg.delay.toString());
            return this.http.post(link, arg.data, httpOptions);
        } else {
            return this.http.post(link, arg.data);
        }
    }

    httpLocalPost<T>(arg: { url: string, data?: any }): Observable<any> {
        const link = `${this.localUrl}/${arg.url}`;
        return this.http.post(link, arg.data);
    }
    httpPostBlob(arg: { url: string, data?: any }): Observable<any> {
        const link = `${this.baseURL}/${arg.url}`;
        return this.http.post(link, arg.data, { responseType: 'blob' });
    }

    httpDelete(arg: { url: string, data?: any }): Observable<any> {
        const link = `${this.baseURL}/${arg.url}`;
        const httpOptions = { body: arg.data, headers: undefined };
        return this.http.delete(link, httpOptions);
    }

    httpPut(arg: { url: string, data?: any }): Observable<any> {
        const link = `${this.baseURL}/${arg.url}`;
        return this.http.put(link, arg.data);
    }

    httpGetJson(arg: { url: string }): Observable<any> {
        const link = `${arg.url}`;
        return this.http.get(link);
    }

    getOptions(delay: any): any {
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-X-Timeout': delay })
        };
        return httpOptions;
    }
    httpForkJoin(forkObj: { fork: any[] }): Observable<any> {
        const baseUrl = `${this.baseURL}/`;
        const mergeAPI = (): any => {
            return forkObj.fork.map((x: any) => {
                if (x.type === 'POST') {
                    if (x.delay) {
                        const httpOptions = this.getOptions(x.delay.toString());
                        return this.http.post(baseUrl + x.url, x.data, httpOptions);
                    }
                    else {
                        return this.http.post(baseUrl + x.url, x.data);
                    }
                } else if (x.type === 'GET') {
                    return this.http.get(baseUrl + x.url);
                } else {
                    return null;
                }
            });
        };
        return forkJoin(mergeAPI())
            .pipe(
                map(Response => this.checkResponseFork(Response)
                ));
    }

    private checkResponseFork(response: any): any {
        const resultsList: any = [];
        response.map((results: any) => {
            if (results) {
                resultsList.push(results);
            } else {
                resultsList.push(results);
            }
        });
        return resultsList;
    }
}
