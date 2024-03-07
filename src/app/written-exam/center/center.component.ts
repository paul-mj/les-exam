import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICenter, IDeviceInfo, IRegisterDevice, IResponseControl } from '../../core/interfaces/exam-wrap.interface';
import { ApiService } from '../../core/services/api/api.service';

interface IInputData {
    deviceInfo: IDeviceInfo
    list: ICenter[]
    blockControl: IResponseControl
}

@Component({
    selector: 'app-center',
    standalone: true,
    imports: [CommonModule, MatButtonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './center.component.html',
    styleUrl: './center.component.scss'
})

export class CenterComponent {

    list: any = [];
    deviceInfo!: IDeviceInfo;
    selectedItem = new FormControl<any>(null, [Validators.required]);
    choosedCenter: string = "";
    isInputValid: boolean = false;
    @Output() onClickNextToVerify = new EventEmitter<IRegisterDevice>();
    @Input() set centerInput(value: IInputData) {
        if (value?.list) {
            this.list = value?.list.map((x: ICenter) => ({ ...x, active: false }));
            this.deviceInfo = value.deviceInfo;
        }
    }

    constructor(
        private api: ApiService
    ) { }

    onClickNextToVerifyScreen(): void {
        if (this.selectedItem.invalid) {
            this.selectedItem.markAllAsTouched();
            this.selectedItem.updateValueAndValidity();
            this.isInputValid = true;
            alert('Your device is not registered, Must need to select one center');
            return;
        }
        const registerParam: any = {
            DeviceIp: this.deviceInfo.IP4Address,
            DeviceKey: this.deviceInfo.BiosId,
            CentreId: this.selectedItem.value.Id,
            DeviceId: null,
            DeviceName: this.deviceInfo.MachineName,
            IsActive: 1
        } 
        this.emitData(registerParam);
    }

    emitData(data: IRegisterDevice) {
        this.onClickNextToVerify.emit(data);
    }

    onClickCenter(item: any): void {
        this.list.forEach((i: any) => i.active = false);
        item.active = !item.active;
        this.choosedCenter = item?.Description;
        this.selectedItem.patchValue(item);
    }


}
