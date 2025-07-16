"use client";
import { Fragment, ReactNode, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <motion.div
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setPos({
                x: (e.clientX - r.left - r.width / 2) / r.width,
                y: (e.clientY - r.top - r.height / 2) / r.height,
              });
            }}
            style={{ rotateX: pos.y * -10, rotateY: pos.x * 10 }}
            className="relative w-full max-w-lg p-6 glass rounded-2xl text-white max-h-[80vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-3 right-3 text-xl leading-none p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <span aria-hidden="true">&times;</span>
            </button>
            {children}
          </motion.div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
