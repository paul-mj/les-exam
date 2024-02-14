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

    userData!: IReadProfile;

    @Input() set readUserProfile(value: UserInput) {
        if (value?.profileDetails) {
            this.userData = value.profileDetails; 
        }
    }


}
