import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { LibraryController } from "./library.controller";
import { LibraryService } from "./library.service";
import { ProjectsModule } from "../projects/projects.module";
import { ClientsModule } from "../clients/clients.module";

@Module({
  imports: [
    ProjectsModule,
    ClientsModule,
    JwtModule.register({
      secret: process.env.AUTH_SECRET ?? "dev-secret-trocar-em-producao",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
