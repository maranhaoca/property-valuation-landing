import {Routes} from "@angular/router";
import {PrivacyPolicyComponent} from "@/src/app/features/privacy-policy/privacy-policy";
import {ValuationContainerComponent} from "@/src/app/features/valuation-form/valuation-container.component";

export const routes: Routes = [
    { path: '', component: ValuationContainerComponent },
    { path: 'privacidade', component: PrivacyPolicyComponent },
    { path: '**', redirectTo: '' }
];