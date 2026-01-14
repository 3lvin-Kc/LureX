// Application use cases - business workflows

pub mod connect_gmail;
pub mod delete_index;
pub mod disconnect_gmail;
pub mod get_status;
pub mod index_files;
pub mod index_gmail;
pub mod search;

pub use connect_gmail::ConnectGmailUseCase;
pub use delete_index::DeleteIndexUseCase;
pub use disconnect_gmail::DisconnectGmailUseCase;
pub use get_status::GetStatusUseCase;
pub use index_files::IndexFilesUseCase;
pub use index_gmail::IndexGmailUseCase;
pub use search::SearchUseCase;
