#ifndef BUFFER_MANAGER_H
#define BUFFER_MANAGER_H

#include "../models/Sample.h"
#include "../config.h"

class BufferManager {

private:
    Sample buffer[BUFFER_SIZE];
    int currentIndex;

public:

    BufferManager();

    bool addSample(const Sample& sample);

    bool isFull() const;

    bool isEmpty() const;

    void clear();

    int size() const;

    Sample* getBuffer();
};

#endif