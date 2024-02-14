import { Injectable, OnDestroy } from '@angular/core';
import { Observable, timer, Subject, of } from 'rxjs';
import { HttpClient, } from '@angular/common/http';
import { switchMap, share, takeUntil, catchError, retry } from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class PingService implements OnDestroy {
    private status$: Observable<any> | undefined;
    private stopPolling = new Subject();
    private msgTriggerSub = new Subject();

    constructor(private http: HttpClient) { }

    startService(): void {
        this.stopPolling.next(false);
        const url = `http://localhost:5150/emiratesId/ping`;

        this.status$ = timer(0, 5000)
            .pipe(
                switchMap(() => this.http.get<any>(url, { responseType: 'text' as 'json' })
                    .pipe(catchError(e => of('error'))
                    )),
                // retry(),
                share(),
                takeUntil(this.stopPolling)
            );
    }

    stopService(): void {
        this.stopPolling.next(false);
    }
    getStatus(): any {
        return this.status$;
    }
    set triggerMsg(value: any) {
        this.msgTriggerSub.next(value);
    }
    get getMsgStatus(): any {
        return this.msgTriggerSub;
    }
    ngOnDestroy(): void {
        this.stopPolling.next(false);
    }

}
