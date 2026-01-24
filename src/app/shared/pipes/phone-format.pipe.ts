import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phone',
    standalone: true
})
export class PhonePipe implements PipeTransform {
    transform(value: string | number): string {
        if (!value) return '';
        const phone = value.toString().replace(/\D/g, '');

        // Exemplo para formato Portugal (9 dígitos: XXX XXX XXX)
        if (phone.length === 9) {
            return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
        }

        return phone;
    }
}