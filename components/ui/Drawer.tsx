"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";

export default function Drawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 flex" onClose={onClose}>
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="ml-auto flex h-full max-w-md w-full">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="w-full bg-bg-card p-6 overflow-y-auto shadow-xl">
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
