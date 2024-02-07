import { Global, Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { FirebaseClientService } from './firebase-client.service';

@Global()
@Module({
  providers: [FirebaseAdminService, FirebaseClientService],
  exports: [FirebaseAdminService, FirebaseClientService],
})
export class FirebaseModule {}
