import { Request, Response } from "express";
import { ContactService } from "../services/contact.service";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/ApiResponse";
import httpsStatusCode from "http-status-codes";
import { Contact } from "../models/contact.model";
import { IContactFilters, IPaginationOptions } from "../types";
import pick from "../utils/pick";
import { paginationFields } from "../const/pagination.const";

export class ContactController {
  private contactService = new ContactService();

  public createContact = catchAsync(async (req: Request, res: Response) => {
    const contact = await this.contactService.createContact(req.body);
    sendResponse<Contact>(res, {
      message: "Contact created successfully",
      statusCode: httpsStatusCode.CREATED,
      data: contact,
      success: true,
    });
  });

  public updateContact = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.contactService.updateContact(id, req.body);
    sendResponse<void>(res, {
      message: "Contact updated successfully",
      statusCode: httpsStatusCode.OK,
      success: true,
    });
  });

  public getAllContacts = catchAsync(async (req: Request, res: Response) => {
    const filters: IContactFilters = pick(req.query, ["searchTerm", "email"]);
    const paginationOptions: IPaginationOptions = pick(
      req.query,
      paginationFields,
    );
    const contacts = await this.contactService.getAllContacts(
      filters,
      paginationOptions,
    );
    sendResponse<Contact[]>(res, {
      message: "Contacts fetched successfully",
      statusCode: httpsStatusCode.OK,
      data: contacts.data,
      meta: contacts.meta,
      success: true,
    });
  });

  public deleteContact = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.contactService.deleteContact(id);
    sendResponse<void>(res, {
      message: "Contact deleted successfully",
      statusCode: httpsStatusCode.OK,
      success: true,
    });
  });

  public deleteMultipleContacts = catchAsync(
    async (req: Request, res: Response) => {
      const { ids } = req.body;
      await this.contactService.deleteMultipleContacts(ids);
      sendResponse<void>(res, {
        message: "Contacts deleted successfully",
        statusCode: httpsStatusCode.OK,
        success: true,
      });
    },
  );
}
