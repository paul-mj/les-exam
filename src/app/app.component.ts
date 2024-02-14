import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PingService } from './core/services/ping/ping.service';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {

    title = 'Written Exam';

    constructor(
        private http: HttpClient,
        private ping: PingService,
    ) {
        /* this.http.get('http://localhost:5150/scanner/getDeviceInfo').subscribe((response: any) => {
            console.log(response, 'respose')
        });
        this.ping.startService();
        this.ping.getStatus().subscribe((res: any) => {
          this.ping.triggerMsg = res;
        }); */
    }

}
