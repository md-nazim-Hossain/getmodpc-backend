import { AppDataSource } from "../config/db";
import { Contact } from "../models/contact.model";
import {
  IContactFilters,
  IGenericResponse,
  IPaginationOptions,
} from "../types";
import ApiError from "../utils/ApiError";
import httpStatusCodes from "http-status-codes";
import {
  calculatePagination,
  calculatePaginationMeta,
} from "../utils/pagination";
import { CreateContactDTO } from "../dto/contact.dto";
import { sendContactUsEmail } from "../config/email";

export class ContactService {
  private readonly contactRepository = AppDataSource.getRepository(Contact);

  async createContact(payload: CreateContactDTO): Promise<Contact> {
    const contactData = this.contactRepository.create(payload);
    const contact = await this.contactRepository.save(contactData);

    // Send email notification
    try {
      await sendContactUsEmail({
        fullName: payload.name || "Anonymous",
        email: payload.email || "",
        message: payload.message || "",
      });
    } catch (error) {
      // Log error but don't fail the creation
      console.error("Failed to send contact email:", error);
    }

    return contact;
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<void> {
    const result = await this.contactRepository.update(id, contact);
    if (result.affected === 0) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Contact not found");
    }
  }

  async getAllContacts(
    filters: IContactFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<Contact[]>> {
    const { searchTerm, email } = filters;
    const { limit, page, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query = this.contactRepository.createQueryBuilder("contact");

    if (email) {
      query.andWhere("contact.email = :email", { email });
    }

    if (searchTerm) {
      query.andWhere(
        "(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.message ILIKE :search)",
        { search: `%${searchTerm}%` },
      );
    }

    query.orderBy(`contact.${sort_by}`, sort_order).skip(skip).take(limit);

    const [contacts, total] = await query.getManyAndCount();

    const meta = calculatePaginationMeta(total, page, limit);

    return {
      data: contacts,
      meta,
    };
  }

  async deleteContact(id: string): Promise<void> {
    const contact = await this.contactRepository.delete(id);
    if (contact.affected === 0) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Contact not found");
    }
  }

  async deleteMultipleContacts(ids: string[]): Promise<void> {
    await this.contactRepository.delete(ids);
  }
}
