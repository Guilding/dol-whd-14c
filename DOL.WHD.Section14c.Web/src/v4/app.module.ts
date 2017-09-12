import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';

import { HelloWorldComponent } from './hello-world.component';
import { mainTopNavDirective } from '../modules/components/mainTopNavControl/mainTopNav.component';

@NgModule({
  imports: [BrowserModule, UpgradeModule],
  declarations: [HelloWorldComponent, mainTopNavDirective],
  entryComponents: [HelloWorldComponent]
})
export class AppModule {
  ngDoBootstrap() {}
}