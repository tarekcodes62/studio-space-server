import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const port = process.env.PORT;

// connect to mongodb
const client = new MongoClient(process.env.DATABASE_URL);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('You successfully connected to MongoDB!');
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongodbClient = await connectToMongoDB();
const db = mongodbClient.db('studioSpace');
const studiosCollection = db.collection('studios');
const bookingsCollection = db.collection('bookings');

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('This is Home page');
});

// featured studios api
app.get('/featured-studios', async (req, res) => {
  const result = await studiosCollection
    .find({})
    .sort({ rating: -1 })
    .limit(6)
    .toArray();
  res.send(result);
});

app.get('/studios', async (req, res) => {
  try {
    const { category } = req.query;

    const categoryMap = {
      'photo-studios': 'Photo Studios',
      'sound-stages': 'Sound Stages',
      'podcast-rooms': 'Podcast Rooms',
      'music-suites': 'Music Suites',
      'art-workshops': 'Art Workshops',
    };

    const filter = categoryMap[category]
      ? { category: categoryMap[category] }
      : {};

    const studios = await studiosCollection.find(filter).toArray();

    res.status(200).send(studios);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch studios' });
  }
});

// studio details api
app.get('/studios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const studio = await studiosCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!studio) {
      return res.status(404).json({
        message: 'Studio not found',
      });
    }

    res.status(200).send(studio);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch studio',
    });
  }
});

app.post('/my-bookings', async (req, res) => {
  const booking = req.body;
  const result = await bookingsCollection.insertOne(booking);
  res.send(result);
});

app.get('/my-bookings/:id', async (req, res) => {
  const { id } = req.params;
  const result = await bookingsCollection.find({ userId: id }).toArray();
  res.send(result);
});

app.patch('/my-bookings/:bookingId/cancel', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await bookingsCollection.updateOne(
      {
        _id: new ObjectId(bookingId),
      },
      {
        $set: {
          status: 'Cancelled',
          updatedAt: new Date(),
        },
      },
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: 'Failed to cancel booking',
    });
  }
});

app.post('/add-studio', async (req, res) => {
  const studio = req.body;
  const result = await studiosCollection.insertOne(studio);
  res.send(result);
});

app.get('/my-listings/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const result = await studiosCollection
      .find({ 'host.email': email })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: 'Failed to fetch listings',
    });
  }
});

app.delete('/studios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await studiosCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        message: 'Studio not found',
      });
    }

    res.send({
      message: 'Studio deleted successfully',
    });
  } catch (error) {
    res.status(500).send({
      message: 'Failed to delete studio',
    });
  }
});

app.get('/studios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    const studio = await studiosCollection.findOne({
      _id: new ObjectId(id),
      'host.email': email,
    });

    if (!studio) {
      return res.status(404).send({
        message: 'Studio not found',
      });
    }

    res.send(studio);
  } catch (error) {
    res.status(500).send({
      message: 'Failed to fetch studio',
    });
  }
});

app.patch('/studios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;
    const { name, ...data } = req.body;

    if (!email) return res.status(400).send({ message: 'Email required' });

    const result = await studiosCollection.updateOne(
      { _id: new ObjectId(id), 'host.email': email },
      {
        $set: {
          ...data,
          name,
          slug: name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
          updatedAt: new Date(),
        },
      },
    );

    if (!result.matchedCount)
      return res.status(404).send({ message: 'Studio not found' });

    res.send({ success: true, message: 'Studio updated successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Failed to update studio' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

export default app;
