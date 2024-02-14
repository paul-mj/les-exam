import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    config: any;
    imageFile: any;

    constructor(private client: HttpClient) { }

    isLocalFilesLoad(): any {
        return new Promise((resolve: any) => {
            const jsonFile = this.client.get(`./assets/JSON/appConfig.json`);
            forkJoin([jsonFile]).subscribe((response: any) => {
                this.config = response[0];
                resolve(true);
            });
        })
    }


}
