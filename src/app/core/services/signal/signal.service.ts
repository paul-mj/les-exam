import { Injectable, signal } from '@angular/core';
import { TransLine } from '../../interfaces/exam-wrap.interface';
 
@Injectable({
    providedIn: 'root'
})

export class SignalService {

    mapPoint = signal(undefined);
    userTransLine: any = signal(null); 

    get selectedMapPoint(): any {
        return this.mapPoint();
    }

    set selectedMapPoint(point: any) {
        this.mapPoint.set(point);
    }
 
    userTypeTransLineData(value: TransLine): void {
        this.userTransLine.set(value);
    }

    get getUserTypeTransLine() {
        return this.userTransLine();
    }

}


 