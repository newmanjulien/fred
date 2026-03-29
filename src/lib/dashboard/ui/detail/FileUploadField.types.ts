type FileUploadQuotePerson = {
	name: string;
	avatar: string;
};

export type FileUploadFieldQuote = {
	text: string;
	people: readonly FileUploadQuotePerson[];
	attribution: string;
	role: string;
	logoSrc: string;
	logoAlt: string;
};

export type FileUploadFieldData = {
	sectionId: string;
	uploadLabel?: string;
	uploadDescription?: string;
	acceptedFileTypes?: string;
	allowMultipleFiles?: boolean;
	quote?: FileUploadFieldQuote;
};
