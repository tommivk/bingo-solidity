import React from "react";

type Props =
  | {
      closeButton?: true;
      setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
      open: boolean;
      children: React.ReactNode;
    }
  | {
      closeButton: false;
      setModalOpen?: undefined;
      open: boolean;
      children: React.ReactNode;
    };

const Modal = ({ open, setModalOpen, children, closeButton = true }: Props) => {
  if (!open) return <></>;

  const getElementByDisplayName = (name: string) => {
    return React.Children.map(children, (child: any) =>
      child.type.displayName === name ? child : null
    );
  };

  const header = getElementByDisplayName("Header");
  const content = getElementByDisplayName("Content");
  const footer = getElementByDisplayName("Footer");

  return (
    <div className="fixed w-[100vw] h-[100vh] bg-black bg-opacity-60 left-0 top-0 z-30 flex items-center justify-center">
      <div className="w-fit max-w-[90vw] h-fit px-10 py-4 max-h-full bg-slate-800 z-50 relative rounded-lg">
        {closeButton && (
          <div
            data-testid="modal-close-btn"
            className="absolute top-2 right-2 h-8 w-8 p-5 text-xl rounded-full bg-slate-600 flex justify-center items-center cursor-pointer hover:bg-slate-500"
            onClick={() => setModalOpen?.(false)}
          >
            ✕
          </div>
        )}
        <div className="h-full flex flex-col justify-between items-center">
          {header}
          {content}
          {footer}
        </div>
      </div>
    </div>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => (
  <div className="text-2xl mb-4">{children}</div>
);
Header.displayName = "Header";
Modal.Header = Header;

const Content = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-2 mb-6">{children}</div>
);
Content.displayName = "Content";
Modal.Content = Content;

const Footer = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

Footer.displayName = "Footer";
Modal.Footer = Footer;

export default Modal;
