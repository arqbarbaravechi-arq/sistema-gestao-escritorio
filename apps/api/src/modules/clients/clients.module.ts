import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";
import { CLIENT_REPOSITORY } from "./domain/client-repository.interface";
import { InMemoryClientRepository } from "./infra/in-memory-client.repository";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_SECRET ?? "dev-secret-trocar-em-producao",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    InMemoryClientRepository,
    { provide: CLIENT_REPOSITORY, useExisting: InMemoryClientRepository },
  ],
  exports: [ClientsService],
})
export class ClientsModule {}
