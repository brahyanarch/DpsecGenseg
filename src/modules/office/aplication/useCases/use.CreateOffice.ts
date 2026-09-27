import { CreateOfficeData } from "../../domain/entities/ent.Office";
import { portOfficeRepository } from "../../domain/repositories/port.Office.Repository";

export class useCreateOffice {
    constructor(private readonly repo: portOfficeRepository) {}

    async execute(data: CreateOfficeData) {
        return this.repo.createOffice(data);
    }
}
