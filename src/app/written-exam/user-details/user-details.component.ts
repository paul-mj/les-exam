import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IReadProfile, UserInput } from '../../core/interfaces/exam-wrap.interface';

@Component({
    selector: 'app-user-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './user-details.component.html',
    styleUrl: './user-details.component.scss'
})

export class UserDetailsComponent {

    // userData!: IReadProfile;

     userData: any = {
        DRIVER_NAME_EN: "John Doe",
        DRIVER_NAME_AR: "جون دو",
        DRIVER_PASSPORT_NO: "123456789",
        PERMIT_NO: "PERMIT123",
        LICENSE_NO: "LICENSE123",
        VEHICLE_TYPE: "Car",
        FRANCHISE_NAME: "ABC Company",
        DRIVER_DOB: new Date("1990-01-01"),
        PERMIT_EXPIRY_DATE: new Date("2025-01-01"),
        LICENSE_EXPIRY_DATE: new Date("2024-12-31"),
        SERVICE_TYPE: "Taxi",
        DRIVER_MOBILE_NO: "1234567890"
    };

    @Input() set readUserProfile(value: UserInput) {
        if (value?.profileDetails) {
            this.userData = value.profileDetails; 
        }
    }


}
