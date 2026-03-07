import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class ConfirmationComponent {
  success = input<boolean>(false);
  error = input<string | null>(null);
  restart = output<void>();
}
