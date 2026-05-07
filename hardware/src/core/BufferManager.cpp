#include "BufferManager.h"

BufferManager::BufferManager() {
    currentIndex = 0;
}

bool BufferManager::addSample(const Sample& sample) {

    if (currentIndex >= BUFFER_SIZE) {
        return false;
    }

    buffer[currentIndex] = sample;
    currentIndex++;

    return true;
}

bool BufferManager::isFull() const {
    return currentIndex >= BUFFER_SIZE;
}

bool BufferManager::isEmpty() const {
    return currentIndex == 0;
}

void BufferManager::clear() {
    currentIndex = 0;
}

int BufferManager::size() const {
    return currentIndex;
}

Sample* BufferManager::getBuffer() {
    return buffer;
}