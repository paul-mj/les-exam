import { Injectable, signal } from '@angular/core';;


@Injectable({
    providedIn: 'root'
})

export class SignalService {
    mapPoint = signal(undefined);

    get selectedMapPoint(): any {
        return this.mapPoint();
    }
    set selectedMapPoint(point: any) {
        this.mapPoint.set(point);
    }
}
