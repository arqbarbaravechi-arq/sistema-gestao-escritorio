import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TeamController } from "./team.controller";
import { TeamService } from "./team.service";
import { ProjectsModule } from "../projects/projects.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    ProjectsModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.AUTH_SECRET ?? "dev-secret-trocar-em-producao",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
